import { useState } from "react";
import { View } from "react-native";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useTransferStorageToPosition from "~/lib/hooks/api/use-transfer-storage-to-position";
import useNotificationModal from "~/lib/hooks/use-notification-modal";

export default function MovePositionPage() {
  const [positionSKU, setPositionSKU] = useState<string | undefined>(undefined);
  const [storageSKU, setStorageSKU] = useState<string | undefined>(undefined);
  const { modal: warningModal, setOpen: openWarningModal } =
    useNotificationModal({
      variant: "danger",
      title: "Scan values first",
      description:
        "Scan storage SKU and position SKU first before transferring.",
    });
  const { modal: successModal, setOpen: openSuccessModal } =
    useNotificationModal({
      title: "Transfer successful",
      description: "Storage has been transferred to the new position.",
    });
  const { mutate, error } = useTransferStorageToPosition({
    onSuccessCallback: () => {
      setPositionSKU(undefined);
      setStorageSKU(undefined);
      openSuccessModal();
    },
    onErrorCallback: () => {
      openErrorModal();
    },
  });
  const { modal: errorModal, setOpen: openErrorModal } = useNotificationModal({
    variant: "danger",
    title: "Error occured",
    description: error,
  });

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <View className="flex justify-center gap-3 w-full">
        <Scanner
          label="Storage"
          mockData="spotexactlyforwaffles123"
          onScan={(data) => {
            setStorageSKU(data);
          }}
        />
        {storageSKU && (
          <View>
            <Text>{`Storage: ${storageSKU}`}</Text>
          </View>
        )}
        <Scanner
          label="Position"
          mockData="randomemptyspot123"
          onScan={(data) => {
            setPositionSKU(data);
          }}
        />
        {positionSKU && (
          <View>
            <Text>{`Position: ${positionSKU}`}</Text>
          </View>
        )}
        <View className="flex flex-row justify-center gap-3 mt-5">
          <Button
            variant="secondary"
            className="flex-1 border"
            onPress={() => {
              if (!positionSKU || !storageSKU) {
                openWarningModal();
              } else {
                mutate({ positionSKU, storageSKU });
              }
            }}
          >
            <Text>Transfer</Text>
          </Button>
          <Button
            variant="destructive"
            className="w-1/3"
            onPress={() => {
              setPositionSKU(undefined);
              setStorageSKU(undefined);
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
