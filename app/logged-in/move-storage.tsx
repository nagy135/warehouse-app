import { useIsFocused } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Scanner from '~/components/scanner';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import useCheckPositionExits from '~/lib/hooks/api/use-check-position-exits';
import useCheckStorageExits, {
  checkStorageExitsResponse,
} from '~/lib/hooks/api/use-check-storage-exits';
import useTransferStorageToPosition from '~/lib/hooks/api/use-transfer-storage-to-position';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { MoveStorageStepEnum, PositionExits } from '~/lib/types';

export default function MovePositionPage() {
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits();
  const { mutateAsync: mutateCheckPositionExits } = useCheckPositionExits();

  const [position, setPosition] = useState<PositionExits>();
  const [storage, setStorage] = useState<checkStorageExitsResponse>();
  const [step, setStep] = useState<MoveStorageStepEnum>(
    MoveStorageStepEnum.SCAN_STORAGE,
  );

  const { modal: storageNotFoundModal, setOpen: openStorageNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('move-section.storage-not-found'),
      description: t('move-section.storage-to-not-found'),
    });

  const { modal: positionNotFoundModal, setOpen: openPositionNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('move-section.position-not-found'),
      description: t('move-section.position-not-found-description'),
    });

  const { modal: positionNotEmptyModal, setOpen: openPositionNotEmptyModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('move-section.position-not-empty'),
      description: t('move-section.position-not-empty-description'),
    });

  const { modal: successModal, setOpen: openSuccessModal } =
    useNotificationModal({
      title: t('move-section.transfer-successful'),
      description: t('move-section.transfer-storage-successful-description'),
      onClose: () => setStep(MoveStorageStepEnum.SCAN_STORAGE),
    });

  const { mutate, error } = useTransferStorageToPosition({
    onSuccessCallback: () => {
      resetProcess();
      openSuccessModal();
    },
    onErrorCallback: () => {
      openErrorModal();
    },
  });

  const resetProcess = () => {
    setPosition(undefined);
    setStorage(undefined);
  };

  const { modal: errorModal, setOpen: openErrorModal } = useNotificationModal({
    variant: 'danger',
    title: t('move-section.transfer-error'),
    description: t('move-section.transfer-storage-error-description', {
      error,
    }),
  });

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <View className="flex w-full justify-center gap-3">
        {isFocused && step === MoveStorageStepEnum.SCAN_STORAGE && (
          <Scanner
            label={t('move-section.scan-storage')}
            mockData="spotexactlyforwaffles123"
            onScan={(data) => {
              mutateCheckStorageExits({ sku: data })
                .then((data) => {
                  setStorage(data);
                  setStep(MoveStorageStepEnum.SCAN_POSITION);
                })
                .catch(openStorageNotFoundModal);
            }}
          />
        )}
        {storage && (
          <View>
            <Text className="text-xl">
              {`${t('move-section.storage')}: `}
              <Text className="text-xl font-bold">{storage.name}</Text>
            </Text>
          </View>
        )}
        {isFocused && step === MoveStorageStepEnum.SCAN_POSITION && (
          <Scanner
            label={t('move-section.scan-new-position')}
            mockData="randomemptyspot123"
            onScan={(data) => {
              mutateCheckPositionExits({ sku: data })
                .then((data) => {
                  if (data.storages.length === 0) {
                    setPosition(data);
                    setStep(MoveStorageStepEnum.FINISH);
                  } else {
                    openPositionNotEmptyModal();
                  }
                })
                .catch(openPositionNotFoundModal);
            }}
          />
        )}
        {position && (
          <View>
            <Text className="text-xl">
              {`${t('move-section.position')}: `}
              <Text className="text-xl font-bold">{position.name}</Text>
            </Text>
          </View>
        )}
        <View className="mt-5 flex flex-row justify-center gap-3">
          {position && storage && (
            <Button
              variant="secondary"
              className="flex-1 border"
              onPress={() => {
                mutate({ positionSKU: position.sku, storageSKU: storage.sku });
              }}
            >
              <Text>{t('move-section.transfer')}</Text>
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-1/3"
            onPress={() => {
              setStep(MoveStorageStepEnum.SCAN_STORAGE);
              resetProcess();
            }}
          >
            <Text>{t('move-section.reset')}</Text>
          </Button>
        </View>
      </View>
      {storageNotFoundModal}
      {positionNotFoundModal}
      {positionNotEmptyModal}
      {successModal}
      {errorModal}
    </View>
  );
}
