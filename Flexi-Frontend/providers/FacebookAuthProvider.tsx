import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@facebook_auth_token";

type FacebookAuthContextValue = {
  isFacebookLinked: boolean;
  accessToken: string | null;
  loading: boolean;
  setFacebookAuth: (token: string, expirationDate?: number) => Promise<void>;
  clearFacebookAuth: () => Promise<void>;
  refreshFacebookAuth: () => Promise<void>;
};

const FacebookAuthContext = createContext<FacebookAuthContextValue | undefined>(undefined);

export const FacebookAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshFacebookAuth = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccessToken(parsed?.accessToken ?? null);
      } else {
        setAccessToken(null);
      }
    } catch (err) {
      console.error("Failed to refresh Facebook auth state", err);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFacebookAuth();
  }, [refreshFacebookAuth]);

  const setFacebookAuth = useCallback(async (token: string, expirationDate?: number) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accessToken: token, expirationDate: expirationDate ?? null })
      );
      setAccessToken(token);
    } catch (err) {
      console.error("Failed to persist Facebook auth token", err);
    }
  }, []);

  const clearFacebookAuth = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear Facebook auth token", err);
    } finally {
      setAccessToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      isFacebookLinked: Boolean(accessToken),
      accessToken,
      loading,
      setFacebookAuth,
      clearFacebookAuth,
      refreshFacebookAuth,
    }),
    [accessToken, loading, setFacebookAuth, clearFacebookAuth, refreshFacebookAuth]
  );

  return <FacebookAuthContext.Provider value={value}>{children}</FacebookAuthContext.Provider>;
};

export const useFacebookAuth = (): FacebookAuthContextValue => {
  const ctx = useContext(FacebookAuthContext);
  if (!ctx) {
    throw new Error("useFacebookAuth must be used within a FacebookAuthProvider");
  }
  return ctx;
};
