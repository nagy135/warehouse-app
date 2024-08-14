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
import Scanner from '~/components/scanner';
import ConfirmationModal from '~/components/confirmation-modal';

export default function DetailPage() {
	const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
	return (
		<View className="m-2 flex-col gap-3">
			<ConfirmationModal buttonTitle="Save" onConfirm={() => console.log('confirmed!')} />
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{entry.name}</CardTitle>
					<CardDescription>#{entry.id}</CardDescription>
				</CardHeader>
				<CardContent>
					<Text>sku: {entry.sku}</Text>
					<Text>{`created by: ${entry.createdById} at ${new Date(entry.createdAt).toUTCString()}`}</Text>
				</CardContent>
				<CardFooter>
					<Scanner />
				</CardFooter>
			</Card>
		</View>
	);
}
