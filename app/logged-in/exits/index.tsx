import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import ExitCard from "~/components/exit-card";
import Scanner from "~/components/scanner";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import useGetRecords from "~/lib/hooks/api/use-get-records";
import { Exit } from "~/lib/types";

export default function ExitsPage() {
  const [searchValue, setSearchValue] = useState("");

  const {
    data: exits,
    isWaiting,
    isLoading,
    error,
    refreshing,
    onRefresh,
  } = useGetRecords<Exit>("exits", searchValue);
  if (error || !exits) return <Text>error</Text>;

  return (
    <>
      <View className="m-3">
        <View className="flex-row gap-3">
          <Input
            className="flex-1"
            placeholder="Search by name..."
            value={searchValue}
            onChangeText={setSearchValue}
          />
          <View className="w-1/3 py-1">
            <Scanner
              size={"sm"}
              onScan={(data) => {
                const foundExit = exits.find((exit: Exit) => exit.sku === data);
                if (foundExit) {
                  Alert.alert(
                    "Found exit",
                    "You scanned exit sku and matched it to exit",
                    [
                      {
                        text: "Cancel",
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: "Go to exit",
                        onPress: () => {
                          router.push({
                            pathname: "./detail",
                            /* @ts-ignore */
                            params: foundExit,
                          });
                        },
                        style: "default",
                      },
                    ]
                  );
                }
              }}
            />
          </View>
        </View>
        <ScrollView
          className="flex"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {exits?.map((exit: Exit, i: number) => (
            <View key={`exit-card-${i}`} className="my-1">
              <ExitCard exit={exit} />
            </View>
          ))}
        </ScrollView>
      </View>
      {(isWaiting || isLoading) && (
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
          <ActivityIndicator size={60} color="#666666" />
        </View>
      )}
    </>
  );
}
