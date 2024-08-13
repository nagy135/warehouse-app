import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Exit, type ToStringOrStringArray } from '~/lib/types';

export default function DetailPage() {
	const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
	return (
		<View>
			<Text>Detail Page</Text>
			<Text>{exit.id}</Text>
			<Text>{exit.name}</Text>
		</View>
	);
}
