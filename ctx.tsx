import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './utils/use-storage-state';

const AuthContext = createContext<{
	signIn: (email: string, password: string) => void;
	signOut: () => void;
	session?: string | null;
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
				signIn: (email, password) => {
					// Perform sign-in logic here
					setSession(email);
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
