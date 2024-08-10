import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import ExitCard from "~/components/exit-card";
import { Input } from "~/components/ui/input";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/api/use-get-records";
import { Exit } from "~/lib/types";

export default function ExitsPage() {
	const [searchValue, setSearchValue] = useState('');

	const [exits, isWaiting] = useGetRecords<Exit>('exits', searchValue);
	if (exits.status !== "success") return <Text>Loading...</Text>;
	if (!Array.isArray(exits.data)) return <Text>error</Text>;

	return (
		<View className="m-3">
			<View className="flex-row">
				<Input
					className="flex-1"
					placeholder='Search by name...'
					value={searchValue}
					onChangeText={setSearchValue}
				/>
				{isWaiting && <ActivityIndicator color="#666666" />}
			</View>
			<ScrollView className="flex">
				{
					exits.data.map((exit: Exit, i: number) => (
						<View key={`exit-card-${i}`} className="my-1">
							<ExitCard exit={exit} />
						</View>
					))
				}
			</ScrollView>
		</View>
	)
}
