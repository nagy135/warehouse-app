import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { useSession } from "~/ctx";
import { Text } from '~/components/ui/text';

const apiRoot = process.env.EXPO_PUBLIC_API_URL;

export default function EntriesPage() {
	const { session } = useSession();

	const fetchEntries = async () => {
		const res = await fetch(`${apiRoot}/entries`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		const data = await res.json();
		return data;
	};

	const query = useQuery({ queryKey: ['entries'], queryFn: fetchEntries });
	if (!query.data?.entries) return <Text>Loading...</Text>;

	return query.data.entries.map((user: any, i: number) => (
		<View key={`user-${i}`}>
			<Text>{user.name}</Text>
		</View>
	)
	);
}
