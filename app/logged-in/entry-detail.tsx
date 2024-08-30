import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Entry, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import useRecordDetail from "~/lib/hooks/api/use-record-detail";
import { useState } from "react";
import ProductStorageList from "~/components/product-storage-list";
import CountModal from "~/components/modal/count-modal";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import useChangeProductStorageState from "~/lib/hooks/api/use-change-product-storage-state";

export default function DetailPage() {
  const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
  const entryId = Number(entry.id);
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchEntries,
  } = useRecordDetail<Entry>(entryId, "entry");
  const { mutate: mutateChangeProductStorageState } =
    useChangeProductStorageState({ onSuccessCallback: refetchEntries });
  const { modal: scanWhereWarningModal, setOpen: openScanWhereWarningModal } =
    useNotificationModal({
      variant: "danger",
      title: "Scan WHERE fist",
      description: "Please scan storage first",
    });
  const { modal: countWarningModal, setOpen: openCountWarningModal } =
    useNotificationModal({
      variant: "danger",
      title: "Not enough items in this entry with given SKU",
      description: "Please try again, in table there is record with count",
    });
  const [selectedStorageSKU, setSelectedStorageSKU] = useState<string | null>(
    null
  );
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
              if (!selectedStorageSKU) {
                openScanWhereWarningModal();
              } else setCountModalOpen(true);
            }}
          />
        </View>
        <View className="flex-1">
          <Scanner
            label="Where"
            variant="secondary"
            mockData="newfancybox123"
            onScan={(data) => {
              setSelectedStorageSKU(data);
            }}
          />
        </View>
      </View>
      {selectedStorageSKU && (
        <Text>
          <Text className="font-bold">Moving to storage:</Text>
          <Text>{` ${selectedStorageSKU}`}</Text>
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
        onConfirm={(count, skuVariantSKU) => {
          console.log(
            data?.productStorages?.map((e) => e.productSkuVariant.sku)
          );
          const productStoragesWithThisSkuVariantIds =
            data?.productStorages
              ?.filter((productStorage) => {
                return productStorage.productSkuVariant.sku === skuVariantSKU;
              })
              .map((e) => e.id) ?? [];
          if (productStoragesWithThisSkuVariantIds.length < count) {
            openCountWarningModal();
          }
          mutateChangeProductStorageState({
            ids: productStoragesWithThisSkuVariantIds.slice(0, count),
            change: "counted",
          });
          setCountModalOpen(false);
        }}
      />
      {scanWhereWarningModal}
      {countWarningModal}
    </View>
  );
}
