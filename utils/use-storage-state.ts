import * as SecureStore from 'expo-secure-store';
import * as React from 'react';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

export type SessionData = {
	accessToken: string;
	refreshToken: string;
	email: string;
};

function useAsyncState<T>(
	initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
	return React.useReducer(
		(state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
		initialValue
	) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: SessionData | null) {
	if (Platform.OS === 'web') {
		try {
			if (value === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, JSON.stringify(value));
			}
		} catch (e) {
			console.error('Local storage is unavailable:', e);
		}
	} else {
		if (value == null) {
			await SecureStore.deleteItemAsync(key);
		} else {
			await SecureStore.setItemAsync(key, JSON.stringify(value));
		}
	}
}

export function useStorageState(key: string): UseStateHook<SessionData> {
	// Public
	const [state, setState] = useAsyncState<SessionData>();

	// Get
	React.useEffect(() => {
		if (Platform.OS === 'web') {
			try {
				if (typeof localStorage !== 'undefined') {
					setState(
						JSON.parse(
							localStorage.getItem(key) ?? '{}'
						) as unknown as SessionData
					);
				}
			} catch (e) {
				console.error('Local storage is unavailable:', e);
			}
		} else {
			SecureStore.getItemAsync(key).then(value => {
				setState(value ? JSON.parse(value) : null);
			});
		}
	}, [key]);

	// Set
	const setValue = React.useCallback(
		(value: SessionData | null) => {
			setState(value);
			setStorageItemAsync(key, value);
		},
		[key]
	);

	return [state, setValue];
}
