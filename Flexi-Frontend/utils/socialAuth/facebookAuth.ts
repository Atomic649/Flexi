import { useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { API_URL } from "@/utils/config";
import { getAxiosWithAuth } from "../axiosInstance";
import { getMemberId } from "../utility";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const FB_APP_ID = "1393521459147449";
const CONFIGURATION_ID = "1953026795255068";
const SCOPES = ["public_profile", "email", "ads_read", "ads_management"];

// Deep link scheme registered in Info.plist / app.json
const APP_SCHEME = "exp+flexi";

/**
 * Main Entry Point
 */
export const loginWithFacebook = async (memberId?: string) => {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // 1. NATIVE BUILD — backend-initiated OAuth so config_id is sent with HTTPS redirect
  if (Platform.OS !== "web" && !isExpoGo) {
    // Pass memberId directly to avoid async delay before opening the browser.
    // Safari blocks window.open() if it doesn't happen synchronously within a user gesture.
    const resolvedMemberId = memberId || (await getMemberId()) || "";
    return await handleNativeLogin(resolvedMemberId);
  }

  // 2. WEB / EXPO GO — client-side OAuth (Expo proxy provides HTTPS redirect)
  return await handleWebLogin();
};

/**
 * Native Login: backend opens Facebook OAuth with config_id, stores token,
 * then redirects back to the app via deep link.
 *
 * Backend must implement:
 *   GET /facebook/auth?memberId=xxx
 *     → 302 to Facebook dialog (config_id, HTTPS redirect_uri)
 *   GET /facebook/callback?code=xxx&state=xxx
 *     → exchange code, store long-lived token
 *     → 302 to exp+flexi://facebook-success?accessToken=xxx&expiresAt=xxx
 */
const handleNativeLogin = async (memberId: string) => {
  try {
    const authUrl = `${API_URL}facebook/auth?memberId=${encodeURIComponent(memberId)}`;

    // Opens ASWebAuthenticationSession; watches for redirect to APP_SCHEME
    const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_SCHEME);

    if (result.type !== "success") {
      return { success: false, error: "Login cancelled or failed" };
    }

    // Parse token from deep link: exp+flexi://facebook-success?accessToken=xxx&expiresAt=xxx
    const url = new URL(result.url);
    const accessToken = url.searchParams.get("accessToken");
    const expiresAt = url.searchParams.get("expiresAt");

    if (!accessToken) {
      const error = url.searchParams.get("error") ?? "No token returned";
      return { success: false, error };
    }

    const finalExpiresAt = expiresAt
      ? Number(expiresAt)
      : Date.now() + 60 * 24 * 60 * 60 * 1000;

    // Save locally (backend already persisted to DB during callback)
    await AsyncStorage.setItem(
      "@facebook_auth_token",
      JSON.stringify({ accessToken, timestamp: Date.now() })
    );

    return { success: true, accessToken, expiresAt: finalExpiresAt };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Browser-based Login (Web & Expo Go)
 * Expo Go uses https://auth.expo.io proxy which Facebook accepts as HTTPS redirect.
 */
const handleWebLogin = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri();
    const discovery = {
      authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
    };

    const request = new AuthSession.AuthRequest({
      clientId: FB_APP_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      extraParams: { config_id: CONFIGURATION_ID },
      scopes: SCOPES,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === "success" && result.params.access_token) {
      return await processLoginSuccess(result.params.access_token);
    }

    console.log("Web login result", result);
    return { success: false, error: "Web authentication failed" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Backend Sync Logic (used by web/Expo Go path only)
 */
const processLoginSuccess = async (token: string) => {
  try {
    const axios = await getAxiosWithAuth();
    const memberId = await getMemberId();

    let finalToken = token;
    let finalExpiresAt: number = Date.now() + 60 * 24 * 60 * 60 * 1000;
    let savedDuringExchange = false;

    try {
      const exchangeResp = await axios.post("/facebook/exchange", {
        accessToken: token,
        memberId,
      });
      if (exchangeResp.data?.accessToken) {
        finalToken = exchangeResp.data.accessToken;
        if (exchangeResp.data?.expiresAt)
          finalExpiresAt = Number(exchangeResp.data.expiresAt);
        savedDuringExchange = !!exchangeResp.data?.saved;
      }
    } catch (e) {
      console.warn("Token exchange failed, using initial token");
    }

    // await AsyncStorage.setItem(
    //   "@facebook_auth_token",
    //   JSON.stringify({ accessToken: finalToken, timestamp: Date.now() })
    // );

    if (memberId && !savedDuringExchange) {
      await axios.post("/facebook/token", {
        memberId,
        token: finalToken,
        expiresAt: finalExpiresAt,
      });
    }

    return { success: true, accessToken: finalToken, expiresAt: finalExpiresAt };
  } catch (err) {
    return {
      success: true,
      accessToken: token,
      expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
    };
  }
};

export const logoutFromFacebook = async (): Promise<boolean> => {
  await AsyncStorage.removeItem("@facebook_auth_token");
  return true;
};

/**
 * Hook-based login for React components.
 * Uses useAuthRequest to pre-load PKCE codes in useEffect so that
 * promptAsync() calls window.open() synchronously within the user gesture,
 * avoiding Safari popup blocking.
 *
 * Usage:
 *   const loginWithFacebook = useFacebookLogin();
 *   // call loginWithFacebook(memberId) from a button handler
 */
export const useFacebookLogin = () => {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const needsWebFlow = Platform.OS === "web" || isExpoGo;

  const redirectUri = AuthSession.makeRedirectUri();

  // useAuthRequest pre-loads PKCE + request metadata in a useEffect.
  // When the user taps the button, promptAsync() is already ready and
  // calls window.open() without any async gap — Safari won't block it.
  const [, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FB_APP_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      extraParams: { config_id: CONFIGURATION_ID },
      scopes: SCOPES,
    },
    { authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth" }
  );

  return useCallback(
    async (memberId?: string) => {
      if (!needsWebFlow) {
        // Native build: backend-initiated OAuth (ASWebAuthenticationSession, no popup blocking)
        const resolvedMemberId = memberId || (await getMemberId()) || "";
        return handleNativeLogin(resolvedMemberId);
      }

      // Web / Expo Go: promptAsync is pre-loaded, window.open fires synchronously
      try {
        const result = await promptAsync();
        if (result?.type === "success" && result.params.access_token) {
          return processLoginSuccess(result.params.access_token);
        }
        console.log("Web login result", result);
        return { success: false, error: "Web authentication failed" };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [needsWebFlow, promptAsync]
  );
};
