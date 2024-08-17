import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import EntryCard from "~/components/entry-card";
import { Input } from "~/components/ui/input";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/hooks/api/use-get-records";
import { Entry } from "~/lib/types";

export default function EntriesPage() {
	const [searchValue, setSearchValue] = useState('');

	const {
		data: entries,
		isWaiting,
		isLoading,
		error,
		refreshing,
		onRefresh,
	} = useGetRecords<Entry>('entries', searchValue);

	if (error) return <Text>error</Text>;


	return (
		<>
			<View className="m-3">
				<Input
					placeholder='Search by name...'
					value={searchValue}
					onChangeText={(val) => {
						setSearchValue(val);
					}}
				/>
				<ScrollView className="flex"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
				>
					{
						entries?.map((entry: Entry, i: number) => (
							<View key={`exit-card-${i}`} className="my-1">
								<EntryCard entry={entry} />
							</View>
						))
					}
				</ScrollView>
			</View>
			{(isWaiting || isLoading) &&
				<View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
					<ActivityIndicator size={60} color="#666666" />
				</View>}
		</>
	)
}
