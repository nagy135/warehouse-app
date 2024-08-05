import { useContext, createContext, type PropsWithChildren } from 'react';
import { SessionData, useStorageState } from './utils/use-storage-state';

const apiRoot = process.env.EXPO_PUBLIC_API_URL;

const AuthContext = createContext<{
	signIn: (email: string, password: string) => void;
	signOut: () => void;
	session?: SessionData | null;
	isLoading: boolean;
}>({
	signIn: () => null,
	signOut: () => null,
	session: null,
	isLoading: false,
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

	return (
		<AuthContext.Provider
			value={{
				signIn: async (email, password) => {
					const response = await fetch(`${apiRoot}/log-in`,
						{
							method: 'POST',
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({ email, password }),
						}
					);
					if (response.status !== 200) {
						throw new Error('Invalid credentials');
					}
					const body = await response.json();

					setSession({
						accessToken: body.accessToken,
						refreshToken: body.refreshToken,
						email
					});
				},
				signOut: () => {
					setSession(null);
				},
				session,
				isLoading,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
