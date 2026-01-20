import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIGURATION_ID, FB_APP_SECRET } from "../config";
import * as WebBrowser from 'expo-web-browser';

// This is critical for returning to the app correctly
WebBrowser.maybeCompleteAuthSession();

// Facebook app settings
const FB_APP_ID = "1393521459147449";

// Redirect handling
// const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: "flexi",path: "oauthredirect"});

const REDIRECT_URI = AuthSession.makeRedirectUri();
// Log it to verify what you need to paste into the Meta Dashboard
console.log('Target Redirect URI:', REDIRECT_URI);

const discovery = {
  authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
};

type LoginResult =
  | { success: true; accessToken: string; expiresAt: number; }
  | { success: false; error: string };

/**
 * Minimal Facebook login flow that works on Expo Go (proxy) and standalone builds.
 */

export const loginWithFacebook = async (): Promise<LoginResult> => {
  try {
    const request = new AuthSession.AuthRequest({
      clientId: FB_APP_ID,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        config_id: CONFIGURATION_ID,
      },
    });

    const result = await request.promptAsync(discovery,
      {showInRecents : true}
    );
    console.log('result 💙',result)

    if (result.type !== "success" || !result.params.access_token) {
      return { success: false, error: "Meta login failed" };
    }

    const accessToken = result.params.access_token;
    console.log('Facebook Token 💙',accessToken)
    const expiresAt = Date.now() + Number(result.params.expires_in || 0) * 1000;

    // Cache token for reuse
    await AsyncStorage.setItem(
      "@facebook_auth_token",
      JSON.stringify({ accessToken, expiresAt }),
    );
    
      console.log('Facebook Token 💙',accessToken,expiresAt)

    return { success: true, accessToken, expiresAt };
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
