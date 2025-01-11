import { useIsFocused } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ClaimType } from '~/app/logged-in/return-index';
import CountModal from '~/components/modal/count-modal';
import Scanner from '~/components/scanner';
import { Text } from '~/components/ui/text';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { ExitWithPackages, ProductSkuVariant } from '~/lib/types';
import ExitProductStorageList from './exit-product-storage-list';
import { Button } from '../ui/button';
import ConfirmationModal from '../modal/confirmation-modal';
import useFinishClaimReturn from '~/lib/hooks/api/use-claim-return-finish';
import StorageModal from '../modal/storage-modal';

export type ScannedProductStorages = {
  productSkuVariantId: number;
  count: number;
  storageSku: string;
};

export default function ScanProducts({
  exit,
  type,
}: {
  exit: ExitWithPackages;
  type: ClaimType;
}) {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { mutateAsync: mutateFinishClaimReturn } = useFinishClaimReturn();
  const [scannedProductStorages, setScannedProductStorages] = useState<
    ScannedProductStorages[]
  >([]);

  const { modal: countWarningModal, setOpen: openCountWarningModal } =
    useNotificationModal({
      variant: 'danger',
      title:
        type === 'claim'
          ? t('return-detail.not-enough-items-claim')
          : t('return-detail.not-enough-items-return'),
      description: t('entry-detail.not-enough-items-description'),
    });

  const { modal: skuNotFoundModal, setOpen: openSkuNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('entry-detail.product-not-found'),
      description: t('entry-detail.product-not-found-description'),
    });

  const { modal: storageNotFoundModal, setOpen: openStorageNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('move-section.storage-not-found'),
      description: t('move-section.storage-to-not-found'),
    });

  const [scannedProductSkuVariant, setScannedProductSkuVariant] =
    useState<ProductSkuVariant>();
  const [count, setCount] = useState<number>();

  const [countModalOpen, setCountModalOpen] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);

  const productStorages = useMemo(
    () =>
      exit.packages
        ?.map((exitPackage) => exitPackage.productStorages)
        .flatMap((item) => item),
    [exit],
  );

  const checkCount = (count: number, productSkuVariantId: number) => {
    const numberOfProductStorages =
      productStorages?.filter(
        (productStorage) =>
          productStorage.productSkuVariantId === productSkuVariantId,
      ).length || 0;
    if (count > numberOfProductStorages) {
      openCountWarningModal();
      return;
    }
    setCount(count);
    setStorageModalOpen(true);
  };

  const addProductStorage = (
    productSkuVariantId: number,
    count: number,
    storageSku: string,
  ) => {
    setScannedProductStorages((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productSkuVariantId === productSkuVariantId,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.productSkuVariantId === productSkuVariantId
            ? { ...item, count: item.count + count }
            : item,
        );
      } else {
        return [...prevItems, { productSkuVariantId, count, storageSku }];
      }
    });
  };
  console.log('scannedProductSkuVariant', scannedProductSkuVariant);
  return (
    <View className="container h-full px-2">
      {type && (
        <Text className="mt-2 text-center text-xl font-bold">
          {type === 'claim'
            ? t('return-detail.claim')
            : t('return-detail.return')}
          : {exit.name}
        </Text>
      )}
      {isFocused && (
        <Scanner
          label={t('return-detail.scan-products')}
          mockData="sweetwaffles50123"
          onScan={(scannedSku) => {
            const productStorage = productStorages?.find(
              (productStorage) =>
                productStorage.productSkuVariant.sku === scannedSku,
            );
            if (productStorage) {
              setScannedProductSkuVariant(productStorage.productSkuVariant);
              setCountModalOpen(true);
            } else {
              openSkuNotFoundModal();
            }
          }}
        />
      )}
      {productStorages && (
        <ExitProductStorageList
          data={productStorages}
          scannedProductStorages={scannedProductStorages}
        />
      )}
      {scannedProductSkuVariant && (
        <CountModal
          open={countModalOpen && isFocused}
          setClose={() => {
            setCountModalOpen(false);
          }}
          productName={scannedProductSkuVariant?.name}
          onConfirm={(count) => checkCount(count, scannedProductSkuVariant.id)}
        />
      )}
      {scannedProductSkuVariant && count && (
        <StorageModal
          onSuccess={(storage) => {
            addProductStorage(scannedProductSkuVariant.id, count, storage.sku);
          }}
          productName={scannedProductSkuVariant?.name ?? ''}
          open={storageModalOpen}
          openStorageNotFoundModal={openStorageNotFoundModal}
          setClose={() => {
            setScannedProductSkuVariant(undefined);
            setCount(undefined);
            setStorageModalOpen(false);
          }}
        />
      )}
      {skuNotFoundModal}
      {countWarningModal}
      {storageNotFoundModal}
      <View className="absolute bottom-10 left-0 right-0 p-4">
        {type === 'claim' && !!scannedProductStorages.length && (
          <ConfirmationModal
            button={
              <Button className="w-full">
                <Text className="text-center">{t('finish')}</Text>
              </Button>
            }
            title={t('confirmation')}
            description={t('return-detail.finish_confirmation')}
            onConfirm={() => {
              mutateFinishClaimReturn({
                exitId: exit.id,
                products: scannedProductStorages,
                type: type,
              });
            }}
          />
        )}
        {type === 'return' &&
          scannedProductStorages.length === productStorages?.length && (
            <Button
              className="w-full"
              onPress={() => {
                mutateFinishClaimReturn({
                  exitId: exit.id,
                  products: scannedProductStorages,
                  type: type,
                });
              }}
            >
              <Text className="text-center">{t('finish')}</Text>
            </Button>
          )}
      </View>
    </View>
  );
}
