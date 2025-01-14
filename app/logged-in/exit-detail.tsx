import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import ExitProductModal from '~/components/modal/exit-product-modal';
import ProductStorageList from '~/components/product-storage-list';
import Scanner from '~/components/scanner';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state';
import useEntryExitMove from '~/lib/hooks/api/use-entry-exit-move';
import useRecordDetail from '~/lib/hooks/api/use-record-detail';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import {
  EntryExitStatesEnum,
  Exit,
  ExitProductStepEnum,
  ProductStorage,
  type ToStringOrStringArray,
} from '~/lib/types';

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const exitId = Number(exit.id);
  const isFocused = useIsFocused();
  const [step, setStep] = useState<ExitProductStepEnum>(
    ExitProductStepEnum.SCAN_LOCATION,
  );
  const [
    productStoragesOnScannedLocation,
    setProductStoragesOnScannedLocation,
  ] = useState<ProductStorage[]>();
  const { mutateAsync: mutateEntryMove } = useEntryExitMove();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchExits,
  } = useRecordDetail<Exit>(exitId, 'exit');
  const { mutateAsync: mutateAsyncChangeProductStorageState } =
    useChangeProductStorageState({ onSuccessCallback: refetchExits });
  const { mutateAsync: mutateExitMove } = useEntryExitMove();

  const {
    modal: PositionSkuNotFoundModal,
    setOpen: openPositionSkuNotFoundModal,
  } = useNotificationModal({
    variant: 'danger',
    title: t('exit-detail.position-not-found'),
    description: t('exit-detail.position-not-found-description'),
  });
  const { modal: MoveErrorModal, setOpen: openMoveErrorModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('exit-detail.exit-error'),
      description: t('exit-detail.exit-move-error-description'),
    });

  const { modal: ExitDoneModal, setOpen: openExitDoneModal } =
    useNotificationModal({
      variant: 'default',
      title: t('exit-detail.exit-successful'),
      description: t('exit-detail.exit-successful-description'),
      onClose: () => {
        router.push({
          pathname: '/logged-in',
        });
      },
    });

  const { modal: ExitErrorModal, setOpen: openExitErrorModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('exit-detail.exit-error'),
      description: t('exit-detail.exit-error-description'),
    });

  useEffect(() => {
    if (data?.state === EntryExitStatesEnum.CREATED) {
      mutateEntryMove({
        type: 'exit',
        id: exitId,
        state: EntryExitStatesEnum.REGISTERED,
      });
    }
  }, [data]);

  const allProductsMoved = data?.productStorages?.every(
    (storage) => storage.state === 'moved',
  );

  if (isLoading || isRefetching) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  }
  return (
    <View className="container h-full px-2">
      <View className="m-2 flex flex-row gap-3">
        <View className="flex-1">
          {isFocused && step === ExitProductStepEnum.SCAN_LOCATION && (
            <Scanner
              label={t('exit-detail.scan-position')}
              mockData="secondshelftontheleft123"
              onScan={(skuCode) => {
                const productStorages = data?.productStorages?.filter(
                  (storage) =>
                    storage.storage.position?.sku === skuCode &&
                    storage.state === 'none',
                );
                if (productStorages?.length) {
                  setProductStoragesOnScannedLocation(productStorages);
                  setStep(ExitProductStepEnum.SCAN_PRODUCT);
                } else {
                  openPositionSkuNotFoundModal();
                }
              }}
            />
          )}
        </View>
      </View>
      {data?.productStorages && (
        <ProductStorageList
          variant="exit"
          exitName={data.name}
          data={data.productStorages}
          state={data.state}
          refetchProductStorages={refetchExits}
        />
      )}
      {allProductsMoved && data?.state !== EntryExitStatesEnum.MOVED && (
        <View className="absolute bottom-10 left-0 right-0 p-4">
          <Button
            className="w-full"
            onPress={() => {
              if (
                data?.productStorages?.every(
                  (storage) => storage.state === 'moved',
                )
              ) {
                mutateExitMove({ type: 'exit', id: exitId })
                  .then(openExitDoneModal)
                  .catch(openExitErrorModal);
              } else {
                router.push({
                  pathname: '/logged-in',
                });
              }
            }}
          >
            <Text className="text-center">{t('exit-list.finish')}</Text>
          </Button>
        </View>
      )}
      <ExitProductModal
        open={step !== ExitProductStepEnum.SCAN_LOCATION}
        step={step}
        setStep={setStep}
        setClose={() => {
          setProductStoragesOnScannedLocation(undefined);
          setStep(ExitProductStepEnum.SCAN_LOCATION);
        }}
        productStoragesOnScannedLocation={productStoragesOnScannedLocation}
        onConfirm={(productStorageIds, boxSku) => {
          mutateAsyncChangeProductStorageState({
            ids: productStorageIds,
            change: 'moved',
            storageSku: boxSku,
          })
            .then(() => setStep(ExitProductStepEnum.SCAN_LOCATION))
            .catch(openMoveErrorModal);
        }}
      />
      {PositionSkuNotFoundModal}
      {MoveErrorModal}
      {ExitDoneModal}
      {ExitErrorModal}
    </View>
  );
}
