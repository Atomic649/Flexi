import { createContext, useContext, useEffect, useRef, useState } from 'react';
import CallAPIUser from '@/api/auth_api';
import { saveToken,  removeToken, removeMemberId } from '@/utils/utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, usePathname } from 'expo-router';

// Define the AuthContextType
type AuthContextType = {
  session: JSON | null; // Update the type according to your backend response
  loading: boolean; // Loading state for session
  login: (email: string, password: string) => Promise<any>; // Login function
  logout: () => void; // Logout function
};

// Create Context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});
AuthContext.displayName = 'AuthContext'; // Explicitly set displayName

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null); // Update the type according to your backend response
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep the latest pathname for async callbacks (deep links can change pathname after first render)
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  // Note: Avoid flag-based navigation side-effects; navigate directly at the event source

  useEffect(() => {
    // Check Session when the app starts
    const fetchSession = async () => {
      try {
        const data = await CallAPIUser.getSessionAPI(); 
        // Make sure session data is properly processed before setting state
        setSession(data.session);
        setLoading(false);
      } catch (error) {
        console.error("Session fetch error:", error);
        await AsyncStorage.setItem('isLoggedIn', 'false'); // Save logout status
        await removeToken(); // Remove the token
        await removeMemberId(); // Remove the memberId        
        
        // Define public routes that don't require authentication
        const publicRoutes = ['/landing', '/login', '/register', '/forgot_password', '/reset_password', '/business_register'];
        const currentPathname = pathnameRef.current || '';
        const isPublicRoute = publicRoutes.some(route => currentPathname.includes(route));

        // Only redirect to landing if we're not on a public route
        if (!isPublicRoute) {
          router.replace('/landing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen to authentication state changes
    const unsubscribe = CallAPIUser.onAuthStateChange((newSession) => {
      // Make sure session data is properly validated before setting state
      if (newSession && typeof newSession === 'object') {
        setSession(newSession);
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    // Cleanup listener if API supports it
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await CallAPIUser.loginAPI({ email, password });
      // Validate the session data before setting it
      if (data && data.session) {
        setSession(data.session);
        await saveToken(data.token); // Save the token
        await AsyncStorage.setItem('isLoggedIn', 'true'); // Save login status      
        await AsyncStorage.setItem("token", "token");
        return data;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      setSession(null);
      await removeToken(); // Remove the token
      await AsyncStorage.setItem('isLoggedIn', 'false'); // Save logout status
      // Safe navigation after cleanup
      router.replace('/landing');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook to access Auth State
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

