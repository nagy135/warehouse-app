import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Exit, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import { useState } from "react";
import { Text } from "~/components/ui/text";
import CountModal from "~/components/modal/count-modal";
import useRecordDetail from "~/lib/hooks/api/use-record-detail";
import ProductStorageList from "~/components/product-storage-list";

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchExits,
  } = useRecordDetail<Exit>(Number(exit.id), "exit");
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
        <Scanner label="What" onScan={() => setCountModalOpen(true)} />
        <Scanner
          label="Where"
          variant="secondary"
          onScan={(_data) => {
            setSelectedStorage(Math.floor(Math.random() * 100));
          }}
        />
      </View>
      {selectedStorage && (
        <View>
          <Text className="font-bold">Moving to storage:</Text>
          <Text>{selectedStorage}</Text>
        </View>
      )}
      {data?.productStorages && (
        <ProductStorageList
          variant="exit"
          data={data.productStorages}
          refetchProductStorages={refetchExits}
        />
      )}
      <CountModal
        open={countModalOpen}
        setClose={() => setCountModalOpen(false)}
        onConfirm={(count) => {
          console.log(count);
          setCountModalOpen(false);
        }}
      />
    </View>
  );
}
