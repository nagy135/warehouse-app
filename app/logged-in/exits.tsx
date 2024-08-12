import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import ExitCard from "~/components/exit-card";
import { Input } from "~/components/ui/input";
import { Text } from '~/components/ui/text';
import useGetRecords from "~/lib/hooks/api/use-get-records";
import { Exit } from "~/lib/types";

export default function ExitsPage() {
	const [searchValue, setSearchValue] = useState('');

	const { data: exits, isWaiting } = useGetRecords<Exit>('exits', searchValue);
	if (!Array.isArray(exits.data) && !exits.isLoading) return <Text>error</Text>;

	return (
		<>
			<View className="m-3">
				<Input
					placeholder='Search by name...'
					value={searchValue}
					onChangeText={setSearchValue}
				/>
				<ScrollView className="flex">
					{
						exits.data?.map((exit: Exit, i: number) => (
							<View key={`exit-card-${i}`} className="my-1">
								<ExitCard exit={exit} />
							</View>
						))
					}
				</ScrollView>
			</View>
			{isWaiting &&
				<View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
					<ActivityIndicator size={60} color="#666666" />
				</View>}
		</>
	)
}
