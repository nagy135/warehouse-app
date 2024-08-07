import { ScrollView } from "react-native";
import EntryCard from "~/components/entry-card";
import { Text } from '~/components/ui/text';
import useGetEntries from "~/lib/api/use-get-entries";
import { Entry } from "~/lib/types";

export default function EntriesPage() {

	const query = useGetEntries();
	if (query.status !== "success") return <Text>Loading...</Text>;

	return (
		<ScrollView className="flex m-3 gap-3">
			{
				query.data.entries.map((entry: Entry, i: number) => (
					<EntryCard key={`entry-card-${i}`} entry={entry} />
				))
			}
		</ScrollView>
	)
}
