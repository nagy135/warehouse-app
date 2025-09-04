import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Scanner from '~/components/scanner';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import useCheckStorageExits, {
  checkStorageExitsResponse,
} from '~/lib/hooks/api/use-check-storage-exits';
import useTransferStorageItems from '~/lib/hooks/api/use-transfer-storage-items';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { MoveStorageItemsStepEnum } from '~/lib/types';

export default function MovePositionPage() {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits();

  const [originalStorage, setOriginalStorage] = useState<checkStorageExitsResponse>();
  const [newStorage, setNewStorage] = useState<checkStorageExitsResponse>();
  const [step, setStep] = useState<MoveStorageItemsStepEnum>(
    MoveStorageItemsStepEnum.SCAN_ORIGINAL_STORAGE,
  );

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const { modal: storageNotFoundModal, setOpen: openStorageNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('move-section.storage-not-found'),
      description: t('move-section.storage-to-not-found'),
    });

  const { modal: successModal, setOpen: openSuccessModal } =
    useNotificationModal({
      title: t('move-section.transfer-successful'),
      description: t('move-section.transfer-storage-items-successful-description'),
      onClose: () => setStep(MoveStorageItemsStepEnum.SCAN_ORIGINAL_STORAGE),
    });

  const { mutate, error } = useTransferStorageItems({
    onSuccessCallback: () => {
      resetProcess();
      openSuccessModal();
    },
    onErrorCallback: () => {
      openErrorModal();
    },
  });

  const resetProcess = () => {
    setOriginalStorage(undefined);
    setNewStorage(undefined);
  };

  const { modal: errorModal, setOpen: openErrorModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.transfer-error'),
    description: t('move-section.transfer-storage-items-error-description', {
      error,
    }),
  });

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <View className="flex w-full justify-center gap-3">
        {isFocused && step === MoveStorageItemsStepEnum.SCAN_ORIGINAL_STORAGE && (
          <Scanner
            label={t('move-section.scan-original-storage')}
            mockData="TP999"
            onScan={(data) => {
              mutateCheckStorageExits({ sku: data, includeItems: true })
                .then((data) => {
                  setOriginalStorage(data);
                  setStep(MoveStorageItemsStepEnum.SCAN_NEW_STORAGE);
                })
                .catch(openStorageNotFoundModal);
            }}
          />
        )}
        {originalStorage && (
          <View className='mb-4'>
            <Text className="text-xl">
              {`${t('move-section.original-storage')}: `}
              <Text className="text-xl font-bold">{originalStorage.name}</Text>
            </Text>
            <Text>
              {`${t('move-section.items-count')}: `}
              <Text className="text-xl font-bold">{originalStorage.productStorages?.length || 0}</Text>
            </Text>
          </View>
        )}
        {isFocused && step === MoveStorageItemsStepEnum.SCAN_NEW_STORAGE && (
          <Scanner
            label={t('move-section.scan-new-storage')}
            mockData="TP994"
            onScan={(data) => {
              mutateCheckStorageExits({ sku: data, includeItems: true })
                .then((data) => {
                  setNewStorage(data);
                  setStep(MoveStorageItemsStepEnum.FINISH);
                })
                .catch(openStorageNotFoundModal);
            }}
          />
        )}
        {newStorage && (
          <View>
            <Text className="text-xl">
              {`${t('move-section.new-storage')}: `}
              <Text className="text-xl font-bold">{newStorage.name}</Text>
            </Text>
            <Text>
              {`${t('move-section.items-count')}: `}
              <Text className="text-xl font-bold">{newStorage.productStorages?.length || 0}</Text>
            </Text>
          </View>
        )}
        <View className="mt-5 flex flex-row justify-center gap-3">
          {originalStorage && newStorage && (
            <Button
              variant="secondary"
              className="flex-1 border"
              onPress={() => {
                mutate({ originalStorageId: originalStorage.id, newStorageId: newStorage.id });
              }}
            >
              <Text>{t('move-section.transfer')}</Text>
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-1/3"
            onPress={() => {
              setStep(MoveStorageItemsStepEnum.SCAN_ORIGINAL_STORAGE);
              resetProcess();
            }}
          >
            <Text>{t('move-section.reset')}</Text>
          </Button>
        </View>
      </View>
      {storageNotFoundModal}
      {successModal}
      {errorModal}
    </View>
  );
}
