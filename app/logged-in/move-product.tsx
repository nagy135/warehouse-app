import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import CountModal from "~/components/modal/count-modal";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useCheckProductExits from "~/lib/hooks/api/use-check-product-exits";
import useCheckStorageExits, { checkStorageExitsResponse } from "~/lib/hooks/api/use-check-storage-exits";
import useTransferProductToStorage from "~/lib/hooks/api/use-transfer-product-to-storage";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import { MoveProductStepEnum, Product, ProductStorage } from "~/lib/types";

export default function MoveProductPage() {
  const isFocused = useIsFocused();
  const { t, } = useTranslation()

  const [step, setStep] = useState<MoveProductStepEnum>(MoveProductStepEnum.SCAN_PRODUCT);
  const [product, setProduct] = useState<Product>();
  const [productCount, setProductCount] = useState<number>();
  const [fromStorage, setFromStorage] = useState<ProductStorage>();
  const [toStorage, setToStorage] = useState<checkStorageExitsResponse>();
  const [countModalOpen, setCountModalOpen] = useState(false)

  const { mutateAsync: mutateCheckProductExits } = useCheckProductExits()
  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits()

  const { modal: productNotFoundModal, setOpen: openProductNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.product-not-found'),
    description: t('move-section.product-not-found-description'),
  })

  const { modal: storageFromNotFoundModal, setOpen: openStorageFromNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.storage-not-found'),
    description: t('move-section.product-storage-not-found-description', { product: product?.name }),
  })

  const { modal: storageNotEnoughItemsModal, setOpen: openStorageNotEnoughItemsModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.not-enought-items'),
    description: t('move-section.not-enought-items-description', { product: product?.name })
  })

  const { modal: storageToNotFoundModal, setOpen: openStorageToNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.storage-not-found'),
    description: t('move-section.storage-to-not-found'),
  })

  const { modal: successModal, setOpen: openSuccessModal } = useNotificationModal({
    title: t('move-section.transfer-successful'),
    description: t('move-section.transfer-successful-description'),
    onClose: () => setStep(MoveProductStepEnum.SCAN_PRODUCT)
  });

  const resetProcess = () => {
    setProduct(undefined);
    setProductCount(undefined);
    setFromStorage(undefined);
    setToStorage(undefined);
  }

  const { mutate: mutateTransferProduct, error } = useTransferProductToStorage({
    onSuccessCallback: () => {
      resetProcess()
      openSuccessModal();
    },
    onErrorCallback: () => {
      openErrorModal();
    },
  });

  const { modal: errorModal, setOpen: openErrorModal } = useNotificationModal({
    variant: "danger",
    title: t('move-section.transfer-error'),
    description: t('move-section.transfer-error-description', { error }),
  });

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <View className="flex justify-center gap-3 w-full">
        {isFocused && step === MoveProductStepEnum.SCAN_PRODUCT && <Scanner
          label={t('move-section.scan-product')}
          mockData="bluepancakes1k123"
          onScan={(data) => {
            mutateCheckProductExits({ sku: data }).then((data) => {
              setProduct(data);
              setStep(MoveProductStepEnum.SCAN_STORAGE_FROM)
            }).catch(openProductNotFoundModal)
          }}
        />}
        {product && (
          <View>
            <Text className="text-xl">{`${t('move-section.product')}: `}<Text className="text-xl font-bold">{product.name}</Text></Text>
          </View>
        )}
        {isFocused && step === MoveProductStepEnum.SCAN_STORAGE_FROM && <Scanner
          label={t('move-section.scan-original-storage')}
          mockData="secondspotexactlyforsourwaffles123"
          onScan={(data) => {
            const storage = product?.productStorages.find(productStorage => productStorage.storage.sku === data)
            if (storage) {
              setFromStorage(storage)
              setCountModalOpen(true)
            } else {
              openStorageFromNotFoundModal()
            }
          }}
        />}
        {fromStorage && (
          <View>
            <Text className="text-xl">{`${t('move-section.original-storage')}: `}<Text className="text-xl font-bold">{fromStorage.storage.name}</Text></Text>
          </View>
        )}
        {productCount && (
          <View>
            <Text className="text-xl">{`${t('move-section.count')}: `}<Text className="text-xl font-bold">{productCount}</Text></Text>
          </View>
        )}
        {isFocused && step === MoveProductStepEnum.SCAN_STORAGE_TO && <Scanner
          label={t('move-section.scan-new-storage')}
          mockData="secondspotexactlyforsourwaffles123"
          onScan={(data) => {
            mutateCheckStorageExits({ sku: data }).then((data) => {
              setToStorage(data);
              setStep(MoveProductStepEnum.FINISH)
            }).catch(openStorageToNotFoundModal)
          }}
        />}
        {toStorage && (
          <View>
            <Text className="text-xl">{`${t('move-section.new-storage')}: `}<Text className="text-xl font-bold">{toStorage.name}</Text></Text>
          </View>
        )}
        <View className="flex flex-row justify-center gap-3 mt-5">
          {product && fromStorage && toStorage && <Button
            variant="secondary"
            className="flex-1 border"
            onPress={() => {
              const productSkuVariantIds = product?.productStorages.filter(productStorage => productStorage.storage.sku === fromStorage.storage.sku).slice(0, productCount).map(item => item.id) || []
              mutateTransferProduct({ productSkuVariantIds: productSkuVariantIds, toStorageSKU: toStorage.sku });
            }}
          >
            <Text>{t('move-section.transfer')}</Text>
          </Button>}
          <Button
            variant="destructive"
            className="w-1/3"
            onPress={() => {
              setStep(MoveProductStepEnum.SCAN_PRODUCT)
              resetProcess()
            }}
          >
            <Text>{t('move-section.reset')}</Text>
          </Button>
        </View>
      </View>
      <CountModal
        open={countModalOpen && isFocused}
        setClose={() => {
          setCountModalOpen(false)
        }}
        productName={product?.name}
        onConfirm={(count) => {
          if (count) {
            const storage = product?.productStorages.filter(productStorage => productStorage.storage.sku === fromStorage?.storage.sku)
            if ((storage?.length || 0) >= count) {
              setProductCount(count)
              setStep(MoveProductStepEnum.SCAN_STORAGE_TO)
            } else {
              openStorageNotEnoughItemsModal()
            }
          }
        }}
      />
      {successModal}
      {errorModal}
      {productNotFoundModal}
      {storageFromNotFoundModal}
      {storageToNotFoundModal}
      {storageNotEnoughItemsModal}
    </View>
  );
}
