import { useState } from "react";
import { ScrollView, View } from "react-native";
import ExitCard from "~/components/exit-card";
import { Input } from "~/components/ui/input";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/api/use-get-records";
import { Exit } from "~/lib/types";

export default function ExitsPage() {
	const [searchValue, setSearchValue] = useState('');

	const entries = useGetRecords<Exit>('exits', searchValue);
	if (entries.status !== "success") return <Text>Loading...</Text>;

	return (
		<View className="m-3">
			<Input
				placeholder='Search by name...'
				value={searchValue}
				onChangeText={setSearchValue}
			/>
			<ScrollView className="flex">
				{
					entries.data.map((exit: Exit, i: number) => (
						<View key={`exit-card-${i}`} className="my-1">
							<ExitCard exit={exit} />
						</View>
					))
				}
			</ScrollView>
		</View>
	)
}
