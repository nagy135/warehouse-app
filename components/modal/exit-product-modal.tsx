import { useIsFocused } from "@react-navigation/native";
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
import useCheckStorageExits from "~/lib/hooks/api/use-check-storage-exits";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import { ExitProductStepEnum, ProductStorage } from "~/lib/types";
import Scanner from "../scanner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation()
  const notMovedSelectedProductStoragesCount = selectedProductStorages?.filter(storage => storage.state === "none").length || 0

  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits()

  const onChangeCount = (text: string) => {
    setCount(text.replace(/[^0-9]/g, ""));
  };

  const { modal: ProductSkuNotFoundModal, setOpen: openProductSkuNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('exit-product-modal.product-not-found'),
    description: t('exit-product-modal.product-not-found-description'),
  })

  const { modal: StorageSkuNotFoundModal, setOpen: openStorageSkuNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('exit-product-modal.storage-not-found'),
    description: t('exit-product-modal.storage-not-found-description'),
  })

  const { modal: CountWarningModal, setOpen: openCountWarningModal } = useNotificationModal({
    variant: 'danger',
    title: t('exit-product-modal.not-enough-items'),
    description: `${t('exit-product-modal.not-enough-items-description')} ${notMovedSelectedProductStoragesCount}`,
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
          title: t('exit-product-modal.scanning-product'), body: isFocused && <Scanner
            label={t('exit-product-modal.scan-product')}
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
          title: `${t('exit-product-modal.product')}: ${selectedProductStorages?.[0].productSkuVariant.name}`, body: <Input
            className="h-5 rounded-md w-full"
            keyboardType="numeric"
            placeholder={t('exit-product-modal.number-of-items')}
            value={count.toString()}
            onChangeText={onChangeCount}
          />
        }
      case ExitProductStepEnum.SCAN_STORAGE:
        return {
          title: t('exit-product-modal.scanning-storage'), body: isFocused && <Scanner
            label={t('exit-product-modal.scan-storage')}
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
            <Text>{t('exit-product-modal.ok')}</Text>
          </AlertDialogCancel>}
          <AlertDialogCancel onPress={setClose}>
            <Text>{t('exit-product-modal.cancel')}</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
      {ProductSkuNotFoundModal}
      {StorageSkuNotFoundModal}
      {CountWarningModal}
    </AlertDialog>
  );
}
