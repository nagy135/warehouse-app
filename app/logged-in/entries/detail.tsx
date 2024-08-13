import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Entry, type ToStringOrStringArray } from '~/lib/types';

export default function DetailPage() {
	const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
	return (
		<View>
			<Text>Detail Page</Text>
			<Text>{entry.id}</Text>
			<Text>{entry.name}</Text>
		</View>
	);
}
