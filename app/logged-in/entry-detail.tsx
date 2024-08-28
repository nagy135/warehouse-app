import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Entry, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import useRecordDetail from "~/lib/hooks/api/use-record-detail";
import { useState } from "react";
import ProductStorageList from "~/components/product-storage-list";
import CountModal from "~/components/modal/count-modal";

export default function DetailPage() {
  const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchEntries,
  } = useRecordDetail<Entry>(Number(entry.id), "entry");
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [countModalOpen, setCountModalOpen] = useState(false);
  if (isLoading || isRefetching)
    return (
      <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  return (
    <View className="h-full px-2 container">
      <View className="m-2 flex flex-row gap-3">
        <View className="flex-1">
          <Scanner
            label="What"
            onScan={() => {
              // TODO: make sure this check runs before scan
              if (!selectedStorage) {
                Alert.alert("Please scan storage first");
              } else setCountModalOpen(true);
            }}
          />
        </View>
        <View className="flex-1">
          <Scanner
            label="Where"
            variant="secondary"
            mockData="2"
            onScan={(data) => {
              setSelectedStorage(Number(data));
            }}
          />
        </View>
      </View>
      {selectedStorage && (
        <Text>
          <Text className="font-bold">Moving to storage:</Text>
          <Text>{` ${selectedStorage}`}</Text>
        </Text>
      )}
      {data?.productStorages && (
        <ProductStorageList
          variant="entry"
          data={data.productStorages}
          refetchProductStorages={refetchEntries}
        />
      )}
      <CountModal
        open={countModalOpen}
        setClose={() => setCountModalOpen(false)}
        onConfirm={(count, skuVariantId) => {
          console.log(
            "================\n",
            "skuVariantId: ",
            skuVariantId,
            "\n================"
          );
          console.log(
            "================\n",
            "count: ",
            count,
            "\n================"
          );
          console.log(
            "================\n",
            "selectedStorage: ",
            selectedStorage,
            "\n================"
          );
          setCountModalOpen(false);
        }}
      />
    </View>
  );
}
