import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Facebook app settings
const FB_APP_ID = '1393521459147449';
const FB_SCOPES = ['public_profile', 'email'];

// Redirect handling
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'flexi' });

const discovery = {
  authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
};

type LoginResult =
  | { success: true; accessToken: string; expiresAt: number; profile: any }
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
      scopes: FB_SCOPES,
    });

    await request.makeAuthUrlAsync(discovery); // Ensures the request is built before prompting

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success' || !result.params.access_token) {
      return { success: false, error: 'Facebook login was cancelled or failed' };
    }

    const accessToken = result.params.access_token;
    const expiresAt = Date.now() + Number(result.params.expires_in || 0) * 1000;

    // Cache token for reuse
    await AsyncStorage.setItem(
      '@facebook_auth_token',
      JSON.stringify({ accessToken, expiresAt })
    );

    const profileResp = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const profile = await profileResp.json();

    if (profile.error) {
      throw new Error(profile.error.message || 'Failed to fetch Facebook profile');
    }

    return { success: true, accessToken, expiresAt, profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Facebook login failed' };
  }
};

export const logoutFromFacebook = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('@facebook_auth_token');
    return true;
  } catch {
    return false;
  }
};

export const isFacebookAuthenticated = async (): Promise<boolean> => {
  try {
    const tokenData = await AsyncStorage.getItem('@facebook_auth_token');
    if (!tokenData) return false;
    const { expiresAt } = JSON.parse(tokenData);
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
};