import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import ConfirmationModal from "~/components/confirmation-modal";
import useExitDetail from "~/lib/hooks/api/use-exit-detail";
import { Exit, type ToStringOrStringArray } from "~/lib/types";
import ProductStorageList from "./product-storage-list";
import Scanner from "~/components/scanner";
import { useState } from "react";
import { Text } from "~/components/ui/text";

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const { data, isLoading } = useExitDetail(Number(exit.id));
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  return (
    <View className="h-full px-2 container">
      <View className="m-2 flex flex-row gap-3">
        <Scanner label="What" />
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
    </View>
  );
}
