import React from "react";
import { Text } from "~/components/ui/text";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
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
		<View className="flex-col gap-3 m-3">
			<Text className="font-bold text-2xl text-center">Product Storages</Text>
			{data?.map((storage, i) => (
				<Card key={`storage-card-${i}`} className="w-full">
					<TouchableOpacity onPress={() => console.log("Do stuff")}>
						<CardHeader>
							<CardTitle>{storage.name}</CardTitle>
							<CardDescription>{storage.id}</CardDescription>
						</CardHeader>
						<CardContent>
							<Text>
								{storage.position?.name}: {storage.position?.qr}
							</Text>
						</CardContent>
						<CardFooter>
							<Text>{storage.type}</Text>
						</CardFooter>
					</TouchableOpacity>
				</Card>
			))}
		</View>
	);
}
