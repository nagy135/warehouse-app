import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import ConfirmationModal from "~/components/modal/confirmation-modal";
import { Exit, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import { useState } from "react";
import { Text } from "~/components/ui/text";
import CountModal from "~/components/modal/count-modal";
import useRecordDetail from "~/lib/hooks/api/use-record-detail";
import ProductStorageList from "~/components/product-storage-list";

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const { data, isLoading } = useRecordDetail<Exit>(Number(exit.id), "exit");
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [countModalOpen, setCountModalOpen] = useState(false);
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
      {!isLoading && data?.productStorages && (
        <ProductStorageList data={data.productStorages} />
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
