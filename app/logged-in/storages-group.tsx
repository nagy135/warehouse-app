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
import { arrayCount } from "~/lib/utils";

export default function ProductStorageGroup() {
  const { storageIds } = useLocalSearchParams<{ storageIds: string }>();
  const storageIdsNumber = storageIds.split(",").map((id) => Number(id));
  const { data, isLoading, isRefetching } =
    useGetStoragesById(storageIdsNumber);

  if (isLoading || isRefetching)
    return (
      <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  return (
    <ScrollView className="flex m-3">
      {data?.map((storage, i) => (
        <Card key={`storage-card-${i}`} className="w-full my-1">
          <TouchableOpacity onPress={() => console.log("Do stuff")}>
            <CardHeader>
              <CardTitle>
                {`(${arrayCount(storageIdsNumber, storage.id)}x) ${
                  storage.name
                }`}
              </CardTitle>
              <CardDescription>{`${storage.type} #${storage.id}`}</CardDescription>
            </CardHeader>
            {storage.position && (
              <>
                <CardContent>
                  <Text className="text-lg font-bold">Position: </Text>
                  <Text>{storage.position?.name}</Text>
                </CardContent>
                <CardFooter>
                  <Text className="text-lg font-bold">QR: </Text>
                  <Text>{storage.position?.qr}</Text>
                </CardFooter>
              </>
            )}
          </TouchableOpacity>
        </Card>
      ))}
    </ScrollView>
  );
}
