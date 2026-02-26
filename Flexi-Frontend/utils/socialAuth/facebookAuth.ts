import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAxiosWithAuth } from "../axiosInstance";
import { getMemberId } from "../utility";
import * as WebBrowser from 'expo-web-browser';


// This is critical for returning to the app correctly
WebBrowser.maybeCompleteAuthSession();


// Redirect handling
// const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: "flexi",path: "oauthredirect"});

const REDIRECT_URI = AuthSession.makeRedirectUri();
// Log it to verify what you need to paste into the Meta Dashboard
//console.log('Target Redirect URI:', REDIRECT_URI);

const discovery = {
  authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
};

type FacebookProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  picture?: { data: { url: string } };
};

type LoginResult =
  | { success: true; accessToken: string; expiresAt: number; profile: FacebookProfile }
  | { success: false; error: string };

/**
 * Minimal Facebook login flow that works on Expo Go (proxy) and standalone builds.
 */

export const loginWithFacebook = async (): Promise<LoginResult> => {
  try {
    const FB_APP_ID = process.env.EXPO_PUBLIC_FB_APP_ID;
    if (!FB_APP_ID) {
      return { success: false, error: "Facebook App ID not configured" };
    }
    const request = new AuthSession.AuthRequest({
      clientId: FB_APP_ID,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      scopes: ['public_profile', 'email'],
      extraParams: {},
    });

    const result = await request.promptAsync(discovery,
      {showInRecents : true}
    );
    console.log('result 💙',result)

    if (result.type !== "success" || !result.params.access_token) {
      return { success: false, error: "Meta login failed" };
    }

    const accessToken = result.params.access_token;
    console.log('Facebook Token (short-lived) 💙', accessToken)

    // Try to exchange short-lived token for a long-lived token via backend
    let finalAccessToken = accessToken;
    let finalExpiresAt = Date.now() + Number(result.params.expires_in || 0) * 1000;
    // try {
    //   const axios = await getAxiosWithAuth();
    //   const resp = await axios.post("/facebook/exchange", { accessToken });
    //   if (resp?.data?.accessToken) {
    //     finalAccessToken = resp.data.accessToken;
    //     finalExpiresAt = resp.data.expiresAt ? Number(resp.data.expiresAt) : finalExpiresAt;
    //     console.log('Received long-lived Facebook token from backend', finalAccessToken, finalExpiresAt);
    //   } else {
    //     console.warn('Backend exchange did not return a long-lived token; using short-lived token');
    //   }
    // } catch (err) {
    //   console.warn('Facebook token exchange failed or not authenticated; using short-lived token', err);
    // }

    // Cache token for reuse
    await AsyncStorage.setItem(
      "@facebook_auth_token",
      JSON.stringify({ accessToken: finalAccessToken, expiresAt: finalExpiresAt }),
    );
    console.log('Facebook Token stored 💙', finalAccessToken, finalExpiresAt)

    // Fetch user profile from Graph API
    let profile: FacebookProfile = { id: '' };
    try {
      const graphRes = await fetch(
        `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${finalAccessToken}`
      );
      profile = await graphRes.json();
      console.log('Facebook profile 💙', profile);
    } catch (err) {
      console.warn('Failed to fetch Facebook profile:', err);
    }

    // Send token to backend to store in database (if user is logged in)
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const axios = await getAxiosWithAuth();
        await axios.post("/facebook/token", { memberId, token: finalAccessToken, expiresAt: finalExpiresAt });
        console.log("Saved Facebook token to backend for member", memberId);
      } else {
        console.warn("No memberId found; skipping backend token save");
      }
    } catch (err) {
      console.warn("Failed to save Facebook token to backend:", err);
    }

    return { success: true, accessToken: finalAccessToken, expiresAt: finalExpiresAt, profile };
  } catch (err: any) {
    return { success: false, error: err?.message || "Facebook login failed" };
  }
};

export const isFacebookAuthenticated = async (): Promise<boolean> => {
  try {
    const tokenData = await AsyncStorage.getItem("@facebook_auth_token");
    if (!tokenData) return false;
    const { expiresAt } = JSON.parse(tokenData);
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
};

export const logoutFromFacebook = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem("@facebook_auth_token");
    return true;
  } catch (err) {
    console.warn("Failed to remove facebook auth token:", err);
    return false;
  }
};
