import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import ConfirmationModal from '~/components/confirmation-modal';
import Scanner from '~/components/scanner';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exit, type ToStringOrStringArray } from '~/lib/types';

export default function DetailPage() {
	const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
	return (
		<>
			<ConfirmationModal onConfirm={() => console.log('confirmed!')} />
			<View className="mx-3">
				<Card className='w-full'>
					<CardHeader>
						<CardTitle>{exit.name}</CardTitle>
						<CardDescription>#{exit.id}</CardDescription>
					</CardHeader>
					<CardContent>
						<Text>sku: {exit.sku}</Text>
						<Text>{`created by: ${exit.createdById} at ${new Date(exit.createdAt).toUTCString()}`}</Text>
					</CardContent>
					<CardFooter>
						<Scanner />
					</CardFooter>
				</Card>
			</View>
		</>
	);
}
