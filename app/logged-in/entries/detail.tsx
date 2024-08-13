import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Entry, type ToStringOrStringArray } from '~/lib/types';

export default function DetailPage() {
	const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
	return (
		<View className="m-5">
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{entry.name}</CardTitle>
					<CardDescription>exit number #{entry.id}</CardDescription>
				</CardHeader>
				<CardContent>
					<Text>Content</Text>
				</CardContent>
				<CardFooter>
					<Text>Do stuff</Text>
				</CardFooter>
			</Card>
		</View>
	);
}
