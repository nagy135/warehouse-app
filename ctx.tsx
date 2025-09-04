import { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { SessionData, useStorageState } from './utils/use-storage-state';
import { router } from 'expo-router';
import { isTokenExpired, isTokenValid } from './lib/utils';

const apiRoot = process.env.EXPO_PUBLIC_API_URL;

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  session?: SessionData | null;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
  refreshToken: () => Promise.resolve(false),
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  // Check token validity on app start and when session changes
  useEffect(() => {
    if (session?.accessToken) {
      if (isTokenExpired(session.accessToken)) {
        // Token is expired or will expire soon, try to refresh
        if (isTokenValid(session.accessToken)) {
          // Token is still valid but will expire soon, refresh it
          refreshToken();
        } else {
          // Token is completely expired, sign out
          console.log('Token expired, signing out');
          signOut();
        }
      }
    }
  }, [session?.accessToken]);


  const refreshToken = async (): Promise<boolean> => {
    if (!session?.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${apiRoot}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (response.status === 200) {
        const body = await response.json();
        setSession({
          accessToken: body.accessToken,
          refreshToken: body.refreshToken || session.refreshToken,
          email: session.email,
        });
        return true;
      } else {
        // Refresh failed, sign out
        console.log('Token refresh failed, signing out');
        signOut();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      signOut();
      return false;
    }
  };

  const signOut = () => {
    setSession(null);
    // Navigate to login page
    router.replace('/');
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email, password) => {
          const response = await fetch(`${apiRoot}/log-in`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          if (response.status !== 200) {
            throw new Error('Invalid credentials');
          }
          const body = await response.json();

          setSession({
            accessToken: body.accessToken,
            refreshToken: body.refreshToken,
            email,
          });
        },
        signOut,
        session,
        isLoading,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
