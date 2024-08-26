import React from "react";
import { Text } from "~/components/ui/text";
import {
	ActivityIndicator,
	TouchableOpacity,
	View,
	ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import useGetStoragesById from "~/lib/hooks/api/use-get-storages-by-id";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export default function ProductStorageGroup() {
	const { storageIds } = useLocalSearchParams<{ storageIds: string }>();
	const { data, isLoading, isRefetching } = useGetStoragesById(
		storageIds.split(",").map((id) => Number(id))
	);
	if (isLoading || isRefetching)
		return (
			<View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
				<ActivityIndicator size={60} color="#666666" />
			</View>
		);
	return (
		<ScrollView className="flex m-3">
			<Text className="font-bold text-2xl text-center">Product Storages</Text>
			<Text className="text-sm text-center">
				Take product from these storages
			</Text>
			{data?.map((storage, i) => (
				<Card key={`storage-card-${i}`} className="w-full my-1">
					<TouchableOpacity onPress={() => console.log("Do stuff")}>
						<CardHeader>
							<CardTitle>{storage.name}</CardTitle>
							<CardDescription>{`${storage.type} #${storage.id}`}</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className="text-lg font-bold">Position: </Text>
							<Text>{storage.position?.name}</Text>
						</CardContent>
						<CardFooter>
							<Text className="text-lg font-bold">QR: </Text>
							<Text>{storage.position?.qr}</Text>
						</CardFooter>
					</TouchableOpacity>
				</Card>
			))}
		</ScrollView>
	);
}
