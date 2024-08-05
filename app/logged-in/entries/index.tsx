import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { useSession } from "~/ctx";
import { Text } from '~/components/ui/text';

const apiRoot = process.env.EXPO_PUBLIC_API_URL;

export default function EntriesPage() {
	const { session } = useSession();

	const fetchUsers = async () => {
		const res = await fetch(`${apiRoot}/entries`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		const data = await res.json();
		return data;
	};

	const query = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
	if (!query.data?.users) return <Text>Loading...</Text>;

	return query.data.users.map((user: any, i: number) => (
		<View key={`user-${i}`}>
			<Text>{user.name}</Text>
		</View>
	)
	);
}
