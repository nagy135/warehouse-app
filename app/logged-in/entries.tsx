import { ScrollView } from "react-native";
import EntryCard from "~/components/entry-card";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/api/use-get-records";
import { Entry } from "~/lib/types";

export default function EntriesPage() {

	const entries = useGetRecords<Entry>('entries');
	if (entries.status !== "success") return <Text>Loading...</Text>;

	return (
		<ScrollView className="flex m-3 gap-3">
			{
				entries.data.map((entry: Entry, i: number) => (
					<EntryCard key={`entry-card-${i}`} entry={entry} />
				))
			}
		</ScrollView>
	)
}
