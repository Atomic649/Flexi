import { Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { getAxiosWithAuth } from "../axiosInstance";
import { getMemberId } from "../utility";

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const FB_APP_ID = "1393521459147449";
const CONFIGURATION_ID = "1953026795255068";
const SCOPES = ['public_profile', 'email', 'ads_read', 'ads_management'];

/**
 * Main Entry Point
 */
export const loginWithFacebook = async (_memberId?: string) => {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // 1. MOBILE LOGIC (iOS / Android)
  if (Platform.OS !== "web") {
    if (isExpoGo) {
      return await handleWebLogin(); 
    }

    try {
      const { LoginManager, AccessToken, Settings } = require('react-native-fbsdk-next');

      // iOS Tracking Permission (Required for modern iOS)
      if (Platform.OS === 'ios' && Device.isDevice) {
        try {
          const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
          const { status } = await requestTrackingPermissionsAsync();
          await Settings.setAdvertiserTrackingEnabled(status === 'granted');
        } catch (e) {
          console.warn("Tracking transparency check failed", e);
        }
      }
      
      // SET CONFIGURATION ID FOR BUSINESS LOGIN
      // This solves the 'configId' requirement on native builds
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          // Some versions of the native SDK allow this method:
          if (LoginManager.setConfigurationID) {
            LoginManager.setConfigurationID(CONFIGURATION_ID);
          }
        } catch (e) {
          console.warn("Could not set Native ConfigurationID manually, relying on App ID defaults.");
        }
      }

      const result = await LoginManager.logInWithPermissions(SCOPES);

      if (result.isCancelled) return { success: false, error: "Login cancelled" };

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) return { success: false, error: "Failed to get token" };

      return await processLoginSuccess(data.accessToken.toString());
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 2. WEB LOGIC
  return await handleWebLogin();
};

/**
 * Browser-based Login (Web & Expo Go Fallback)
 */
const handleWebLogin = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri();
    const discovery = { authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth" };
    
    const request = new AuthSession.AuthRequest({
      clientId: FB_APP_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      extraParams: { config_id: CONFIGURATION_ID },
      scopes: SCOPES
    });

    const result = await request.promptAsync(discovery);
    
    
    // Web returns access_token in the URL fragment (params)
    if (result.type === "success" && result.params.access_token) {

      console.log("access_token", result.params.access_token);
    
      return await processLoginSuccess(result.params.access_token);
      
    }

    console.log("Web login result", result);
    return { success: false, error: "Web authentication failed" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Backend Sync Logic
 */
const processLoginSuccess = async (token: string) => {
  try {
    const axios = await getAxiosWithAuth();
    const memberId = await getMemberId();

    // A. Exchange for Long-Lived Token (Backend handles Meta API call)
    // Pass memberId so the backend auto-saves the token during exchange
    let finalToken = token;
    let finalExpiresAt: number = Date.now() + 60 * 24 * 60 * 60 * 1000; // default 60-day expiry
    let savedDuringExchange = false;
    try {
      const exchangeResp = await axios.post("/facebook/exchange", { accessToken: token, memberId });
      if (exchangeResp.data?.accessToken) {
        finalToken = exchangeResp.data.accessToken;
        if (exchangeResp.data?.expiresAt) finalExpiresAt = Number(exchangeResp.data.expiresAt);
        savedDuringExchange = !!exchangeResp.data?.saved;

        console.log("Token exchange successful, obtained long-lived token");
        console.log("Original Token:", token);
        console.log("Exchanged Token:", finalToken);
      }
    } catch (e) {
      console.warn("Token exchange failed, using initial token");
    }

    // B. Save Locally
    await AsyncStorage.setItem("@facebook_auth_token", JSON.stringify({
      accessToken: finalToken,
      timestamp: Date.now()
    }));

    // C. SEND TO BACKEND DATABASE (Sync if user is logged in and exchange didn't already save it)
    if (memberId && !savedDuringExchange) {
      await axios.post("/facebook/token", {
        memberId,
        token: finalToken,
        expiresAt: finalExpiresAt,
      });
      console.log("Token synced to backend database");
    }

    return { success: true, accessToken: finalToken, expiresAt: finalExpiresAt };
  } catch (err) {
    return { success: true, accessToken: token, expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000 };
  }
};

export const logoutFromFacebook = async (): Promise<boolean> => {
  const isNativeBuild = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
  if (Platform.OS !== 'web' && isNativeBuild) {
    try {
      const { LoginManager } = require('react-native-fbsdk-next');
      LoginManager.logOut();
    } catch (e) {}
  }
  await AsyncStorage.removeItem("@facebook_auth_token");
  return true;
};