import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import ConfirmationModal from "~/components/confirmation-modal";
import useExitDetail from "~/lib/hooks/api/use-exit-detail";
import { Exit, type ToStringOrStringArray } from "~/lib/types";
import ProductStorageList from "./product-storage-list";
import Scanner from "~/components/scanner";

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const { data, isLoading } = useExitDetail(Number(exit.id));
  return (
    <View className="h-full px-2">
      <View className="m-2 flex flex-row gap-3">
        <Scanner />
        <ConfirmationModal
          buttonTitle="Save"
          onConfirm={() => console.log("confirmed!")}
        />
      </View>
      {!isLoading && data?.productStorages && (
        <ProductStorageList
          data={[
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
            ...data.productStorages,
          ]}
        />
      )}
    </View>
  );
}
