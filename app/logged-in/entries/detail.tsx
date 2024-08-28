import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Entry, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import ConfirmationModal from "~/components/modal/confirmation-modal";
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
    refetch: refetchProductStorages,
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
        <Scanner label="What" onScan={() => setCountModalOpen(true)} />
        <Scanner
          label="Where"
          variant="secondary"
          onScan={(_data) => {
            setSelectedStorage(Math.floor(Math.random() * 100));
          }}
        />
        <ConfirmationModal
          buttonTitle="Save"
          onConfirm={() => console.log("confirmed!")}
        />
      </View>
      {selectedStorage && (
        <View>
          <Text>Selected storage: {selectedStorage}</Text>
        </View>
      )}
      {data?.productStorages && (
        <ProductStorageList
          data={data.productStorages}
          refetchProductStorages={refetchProductStorages}
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
