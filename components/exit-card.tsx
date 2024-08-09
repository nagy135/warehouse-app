import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { type Exit } from '~/lib/types';

export default function ExitCard({ exit }: { exit: Exit }) {
	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>{exit.name}</CardTitle>
				<CardDescription>entry number #{exit.id}</CardDescription>
			</CardHeader>
			<CardContent>
				<Text>Content</Text>
			</CardContent>
			<CardFooter>
				<Text>Do stuff</Text>
			</CardFooter>
		</Card>
	);
}
