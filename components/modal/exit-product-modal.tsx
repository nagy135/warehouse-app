import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { ExitProductStepEnum, ProductSkuVariant, ProductStorage } from "~/lib/types";
import Scanner from "../scanner";
import { useIsFocused } from "@react-navigation/native";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import useCheckStorageExits from "~/lib/hooks/api/use-check-storage-exits";

export default function ExitProductModal({
  open,
  setClose,
  onConfirm,
  step,
  setStep,
  productStoragesOnScannedLocation
}: {
  open: boolean;
  setClose: () => void;
  onConfirm: (productStorageIds: number[], boxSku: string) => void;
  step: ExitProductStepEnum
  setStep: Dispatch<SetStateAction<ExitProductStepEnum>>
  productStoragesOnScannedLocation?: ProductStorage[]
}) {
  const [count, setCount] = useState("");
  const [selectedProductStorages, setSelectedProductStorages] = useState<ProductStorage[]>()
  const isFocused = useIsFocused();
  const notMovedSelectedProductStoragesCount = selectedProductStorages?.filter(storage => storage.state === "none").length || 0

  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits()

  const onChangeCount = (text: string) => {
    setCount(text.replace(/[^0-9]/g, ""));
  };

  const { modal: ProductSkuNotFoundModal, setOpen: openProductSkuNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: 'Produkt nebol nájdeny',
    description: 'Naskenovaný SKU kód nepríslucha žiadnemu produktu na naskenovanej pozícií',
  })

  const { modal: StorageSkuNotFoundModal, setOpen: openStorageSkuNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: 'Úložisko nebolo nájdené',
    description: 'Naskenovaný SKU kód nepríslucha žiadnemu úložisku',
  })

  const { modal: CountWarningModal, setOpen: openCountWarningModal } = useNotificationModal({
    variant: 'danger',
    title: 'Na danej pozícii nie je dostatok položiek s daným kódom SKU',
    description: `Na tejto pozícii sa nachadzá počet položiek: ${notMovedSelectedProductStoragesCount}`,
  })

  useEffect(() => {
    if (!open) {
      setCount('')
    }
  }, [open])

  const modalText = useMemo(() => {
    switch (step) {
      case ExitProductStepEnum.SCAN_PRODUCT:
        return {
          title: "Skenovanie produktu", body: isFocused && <Scanner
            label="Oskenujte produkt"
            variant="secondary"
            mockData="USBPUPRPLE1PIECE"
            onScan={(skuCode) => {
              const storages = productStoragesOnScannedLocation?.filter(storage => storage.productSkuVariant.sku === skuCode)
              if (storages?.length) {
                setSelectedProductStorages(storages)
                setStep(ExitProductStepEnum.SET_COUNT)
              } else {
                openProductSkuNotFoundModal()
              }
            }}
          />
        }
      case ExitProductStepEnum.SET_COUNT:
        return {
          title: `Product: ${selectedProductStorages?.[0].productSkuVariant.name}`, body: <Input
            className="h-5 rounded-md w-full"
            keyboardType="numeric"
            placeholder="number of items"
            value={count.toString()}
            onChangeText={onChangeCount}
          />
        }
      case ExitProductStepEnum.SCAN_STORAGE:
        return {
          title: "Skenovanie boxu", body: isFocused && <Scanner
            label="Oskenujte box"
            variant="secondary"
            mockData="StorageA4"
            onScan={async (storageCode) => {
              mutateCheckStorageExits({ sku: storageCode })
                .then((storageResp) => {
                  const productStorageIds = selectedProductStorages?.slice(0, Number(count)).map(item => item.id) || []
                  onConfirm(productStorageIds, storageResp.sku);
                })
                .catch(openStorageSkuNotFoundModal)
            }}
          />
        }

    }
  }, [step, count, selectedProductStorages, productStoragesOnScannedLocation])

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="h-14">
            <View>
              <Text className="font-extrabold text-lg">
                {modalText?.title}
              </Text>
            </View>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <View className="h-12">
              {modalText?.body}
            </View>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {step === ExitProductStepEnum.SET_COUNT && <AlertDialogCancel
            onPress={() => {
              if (Number(count) > notMovedSelectedProductStoragesCount) {
                openCountWarningModal()
              } else {
                setStep(ExitProductStepEnum.SCAN_STORAGE)
              }
            }}
          >
            <Text>Ok</Text>
          </AlertDialogCancel>}
          <AlertDialogCancel onPress={setClose}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
      {ProductSkuNotFoundModal}
      {StorageSkuNotFoundModal}
      {CountWarningModal}
    </AlertDialog>
  );
}
