import { useState } from "react";
import { View } from "react-native";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useTransferProductToStorage from "~/lib/hooks/api/use-transfer-product-to-storage";
import useNotificationModal from "~/lib/hooks/use-notification-modal";

export default function MoveStoragePage() {
  const [productSkuVariantSKU, setProductSkuVariantSKU] = useState<
    string | undefined
  >(undefined);
  const [fromStorageSKU, setFromStorageSKU] = useState<string | undefined>(
    undefined
  );
  const [toStorageSKU, setToStorageSKU] = useState<string | undefined>(
    undefined
  );
  const { modal: warningModal, setOpen: openWarningModal } =
    useNotificationModal({
      title: "Scan values first",
      description:
        "Scan product SKU and storages SKU first before transferring.",
    });
  const { modal: successModal, setOpen: openSuccessModal } =
    useNotificationModal({
      title: "Transfer successful",
      description: "Product has been transferred to the new storage.",
    });
  const { mutate, error } = useTransferProductToStorage({
    onSuccessCallback: () => {
      setProductSkuVariantSKU(undefined);
      setFromStorageSKU(undefined);
      setToStorageSKU(undefined);
      openSuccessModal();
    },
    onErrorCallback: () => {
      openErrorModal();
    },
  });
  const { modal: errorModal, setOpen: openErrorModal } = useNotificationModal({
    title: "Error occured",
    description: error,
  });

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <View className="flex justify-center gap-3 w-full">
        <Scanner
          label="Product"
          mockData="sweetwaffles50123"
          onScan={(data) => {
            setProductSkuVariantSKU(data);
          }}
        />
        {productSkuVariantSKU && (
          <View>
            <Text>{`Product: ${productSkuVariantSKU}`}</Text>
          </View>
        )}
        <Scanner
          label="Storage (from)"
          mockData="spotexactlyforwaffles123"
          onScan={(data) => {
            setFromStorageSKU(data);
          }}
        />
        {fromStorageSKU && (
          <View>
            <Text>{`FROM Storage: ${fromStorageSKU}`}</Text>
          </View>
        )}
        <Scanner
          label="Storage (to)"
          mockData="secondspotexactlyforsourwaffles123"
          onScan={(data) => {
            setToStorageSKU(data);
          }}
        />
        {toStorageSKU && (
          <View>
            <Text>{`TO Storage: ${toStorageSKU}`}</Text>
          </View>
        )}
        <View className="flex flex-row justify-center gap-3 mt-5">
          <Button
            variant="secondary"
            className="flex-1 border"
            onPress={() => {
              if (!productSkuVariantSKU || !fromStorageSKU || !toStorageSKU) {
                openWarningModal();
              } else {
                mutate({ productSkuVariantSKU, fromStorageSKU, toStorageSKU });
              }
            }}
          >
            <Text>Transfer</Text>
          </Button>
          <Button
            variant="destructive"
            className="w-1/3"
            onPress={() => {
              setProductSkuVariantSKU(undefined);
              setFromStorageSKU(undefined);
              setToStorageSKU(undefined);
            }}
          >
            <Text>Reset</Text>
          </Button>
        </View>
      </View>
      {warningModal}
      {successModal}
      {errorModal}
    </View>
  );
}
