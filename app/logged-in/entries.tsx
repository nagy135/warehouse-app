import { useState } from "react";
import { ScrollView, View } from "react-native";
import EntryCard from "~/components/entry-card";
import { Input } from "~/components/ui/input";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/api/use-get-records";
import { Entry } from "~/lib/types";

export default function EntriesPage() {
	const [searchValue, setSearchValue] = useState('');

	const entries = useGetRecords<Entry>('entries', searchValue);
	if (entries.status !== "success") return <Text>Loading...</Text>;
	if (!Array.isArray(entries.data)) return <Text>error</Text>;

	return (
		<View className="m-3">
			<Input
				placeholder='Search by name...'
				value={searchValue}
				onChangeText={(val) => {
					setSearchValue(val);
				}}
			/>
			<ScrollView className="flex">
				{
					entries.data.map((entry: Entry, i: number) => (
						<View key={`exit-card-${i}`} className="my-1">
							<EntryCard entry={entry} />
						</View>
					))
				}
			</ScrollView>
		</View>
	)
}
