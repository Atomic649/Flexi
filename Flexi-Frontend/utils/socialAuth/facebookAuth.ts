import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAxios } from '../axiosInstance';

// Register with the Facebook Developer Portal and get your app ID
// Then replace this with your Facebook App ID
const FB_APP_ID = '1393371655036716';

// Configure Facebook permissions that you need
const FB_PERMISSIONS = ['public_profile', 'email'];

// Make sure to register this URL scheme in your app.json for Expo
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'flexi',
  path: 'facebook-auth',
});

WebBrowser.maybeCompleteAuthSession();

/**
 * Handles Facebook authentication flow using Expo AuthSession
 */
export const loginWithFacebook = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    console.log('🔵 Starting Facebook login flow');
    
    // Check if already authenticated with Facebook
    const fbTokenData = await AsyncStorage.getItem('@facebook_auth_token');
    
    if (fbTokenData) {
      console.log('🔵 Found existing Facebook token, validating...');
      
      // If we already have a token, verify it's still valid
      const tokenInfo = JSON.parse(fbTokenData);
      const now = Date.now();
      
      // If token is still valid and not expired
      if (tokenInfo.expirationDate > now) {
        console.log('🔵 Token is still valid, using existing token');
        return await verifyAndLoginWithFacebookToken(tokenInfo.accessToken);
      }
      
      // Token expired, clear it
      console.log('🔵 Token expired, clearing and requesting new token');
      await AsyncStorage.removeItem('@facebook_auth_token');
    }
    
    // Start a new Facebook authentication flow
   // console.log('🔵 Configuring Facebook auth request with redirect URI:', REDIRECT_URI);
    const authRequestConfig: AuthSession.AuthRequestConfig = {
      responseType: AuthSession.ResponseType.Token,
      clientId: FB_APP_ID,
      scopes: FB_PERMISSIONS,
      redirectUri: REDIRECT_URI,
    };

    const discovery = {
      authorizationEndpoint: 'https://www.facebook.com/v15.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v15.0/oauth/access_token',
    };

   // console.log('🔵 Creating Facebook auth request with config:', JSON.stringify(authRequestConfig));
    const authRequest = new AuthSession.AuthRequest(authRequestConfig);
   // console.log('🔵 Prompting user for Facebook login');
    const authResult = await authRequest.promptAsync(discovery);

    console.log('💙 Facebook Auth Result:', JSON.stringify(authResult, null, 2));


    
    if (authResult.type === 'success') {
    //  console.log('🔵 Facebook auth successful, got access token');
      const { access_token, expires_in } = authResult.params;
      
      // Save token for future use
    //  console.log('🔵 Saving Facebook token with expiration in', expires_in, 'seconds');
      const expirationDate = Date.now() + (Number(expires_in) * 1000);
      await AsyncStorage.setItem('@facebook_auth_token', JSON.stringify({
        accessToken: access_token,
        expirationDate
      }));
      
      // Login with the token
      // console.log('🔵 Verifying Facebook token with backend');
      // return await verifyAndLoginWithFacebookToken(access_token);

      // return success response  to toggle facebook
     // console.log(' Facebook login successful, returning success response')
      return {
        success: true,
        data: {
          accessToken: access_token,
          expirationDate
        }
      };


    } else {
      console.log('🔴 Facebook login was cancelled or failed:', authResult.type);
      return {
        success: false,
        error: 'Facebook login was cancelled or failed'
      };
    }
  } catch (error) {
    console.error('🔴 Facebook login error:', error);
    return {
      success: false,
      error: 'Failed to authenticate with Facebook'
    };
  }
};

/**
 * Verifies Facebook token and logs user in through your backend
 */
const verifyAndLoginWithFacebookToken = async (token: string) => {
  try {
    // Get user data from Facebook using the token  
    const fbUserResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
    const fbUserData = await fbUserResponse.json();
    
    console.log('🔵 Facebook User Data Response:', JSON.stringify(fbUserData, null, 2));
    
    if (fbUserData.error) {
      console.log('🔴 Facebook Graph API error:', fbUserData.error);
      throw new Error(fbUserData.error.message);
    }
      console.log('🔵 Facebook user data retrieved successfully:', fbUserData);
      return {
        success: true,
        data: fbUserData
      };
    } catch (error) {
      console.error('🔴 Facebook verification error:', error);
      return {
        success: false,
        error: 'Failed to verify Facebook credentials'
      };
    }}
      

/**
 * Logs out from Facebook
 */
export const logoutFromFacebook = async (): Promise<boolean> => {
  try {
    console.log('🔵 Logging out from Facebook');
    // Clear stored Facebook token
    await AsyncStorage.removeItem('@facebook_auth_token');
    console.log('🔵 Facebook logout successful');
    return true;
  } catch (error) {
    console.error('🔴 Facebook logout error:', error);
    return false;
  }
};

/**
 * Checks if user is authenticated with Facebook
 */
export const isFacebookAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('🔵 Checking Facebook authentication status');
    const tokenData = await AsyncStorage.getItem('@facebook_auth_token');
    if (!tokenData) {
      console.log('🔵 No Facebook token found');
      return false;
    }
    
    const { expirationDate } = JSON.parse(tokenData);
    const isValid = Date.now() < expirationDate;
    console.log(`🔵 Facebook token is ${isValid ? 'valid' : 'expired'}`);
    return isValid;
  } catch (error) {
    console.error('🔴 Error checking Facebook authentication:', error);
    return false;
  }
};