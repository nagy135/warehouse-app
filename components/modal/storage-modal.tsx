import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Text } from '~/components/ui/text';
import useCheckStorageExits, {
  checkStorageExitsResponse,
} from '~/lib/hooks/api/use-check-storage-exits';
import Scanner from '../scanner';

export default function StorageModal({
  open,
  setClose,
  onSuccess,
  productName,
  openStorageNotFoundModal,
}: {
  open: boolean;
  setClose: () => void;
  onSuccess: (storage: checkStorageExitsResponse) => void;
  productName: string;
  openStorageNotFoundModal: () => void;
}) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="h-14">
            <View>
              <Text className="text-lg">
                {`${t('product')}: `}
                <Text className="text-lg font-bold">{productName}</Text>
              </Text>
            </View>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <View className="h-12">
              {isFocused && (
                <Scanner
                  label={t('move-section.scan-storage')}
                  mockData="spotexactlyforwaffles123"
                  onScan={(data) => {
                    mutateCheckStorageExits({ sku: data })
                      .then((data) => {
                        onSuccess(data);
                        setClose();
                      })
                      .catch(openStorageNotFoundModal);
                  }}
                />
              )}
            </View>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={setClose}>
            <Text>{t('count-modal.cancel')}</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
