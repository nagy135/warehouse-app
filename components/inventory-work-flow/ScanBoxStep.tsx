import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import Scanner from '~/components/scanner';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import useCheckInventoryBox, {
  InventoryProduct,
} from '~/lib/hooks/api/use-check-inventory-box';

interface ScanBoxStepProps {
  positionSku: string;
  onBoxScanned: (
    boxSku: string,
    boxId: string,
    products: InventoryProduct[],
  ) => void;
}

export default function ScanBoxStep({
  positionSku,
  onBoxScanned,
}: ScanBoxStepProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string>('');
  const [showWrongPositionAlert, setShowWrongPositionAlert] = useState(false);
  const [correctPositionName, setCorrectPositionName] = useState<string>('');
  const [pendingBoxSku, setPendingBoxSku] = useState<string>('');
  const [pendingBoxId, setPendingBoxId] = useState<string>('');
  const [pendingProducts, setPendingProducts] = useState<InventoryProduct[]>(
    [],
  );

  const { mutateAsync: mutateCheckBox } = useCheckInventoryBox();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  function handleScan(scan: string) {
    setError('');
    mutateCheckBox({ positionSku, boxSku: scan })
      .then((data) => {
        if (!data.hasCorrectPosition) {
          setPendingBoxSku(scan);
          setPendingBoxId(data.storageId);
          setPendingProducts(data.products);
          setCorrectPositionName(data.correctPositionName ?? '');
          setShowWrongPositionAlert(true);
        } else {
          onBoxScanned(scan, data.storageId, data.products);
        }
      })
      .catch(() => {
        setError(t('inventory.box-not-found'));
      });
  }

  function handleContinueFromAlert() {
    setShowWrongPositionAlert(false);
    onBoxScanned(pendingBoxSku, pendingBoxId, pendingProducts);
  }

  function handleCancelFromAlert() {
    setShowWrongPositionAlert(false);
    setPendingBoxSku('');
    setPendingBoxId('');
    setPendingProducts([]);
    setCorrectPositionName('');
  }

  return (
    <>
      {error && (
        <View className="mb-4 rounded bg-red-100 p-2">
          <Text className="text-center font-bold text-red-600">{error}</Text>
        </View>
      )}

      {/* Wrong Position Alert */}
      {showWrongPositionAlert && (
        <View className="absolute bottom-0 left-0 right-0 top-0 z-50 items-center justify-center p-4">
          <View className="max-w-md rounded-lg border-2 border-red-500 bg-white p-6">
            <Text className="mb-4 text-lg font-bold">
              {t('inventory.wrong-position-title')}
            </Text>
            <Text className="mb-6">
              {t('inventory.wrong-position-message', {
                positionName: correctPositionName,
              })}
            </Text>
            <View className="flex-row justify-end gap-4">
              <Button variant="outline" onPress={handleCancelFromAlert}>
                <Text>{t('confirmation-modal.cancel')}</Text>
              </Button>
              <Button onPress={handleContinueFromAlert}>
                <Text>{t('confirmation-modal.continue')}</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      <View>
        <Text className="mb-4 text-center text-2xl">
          {t('inventory.scan-box')}
        </Text>
        {isFocused && !showWrongPositionAlert && (
          <Scanner
            mockData="SP944"
            label={
              process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true'
                ? t('inventory.scan-box')
                : ''
            }
            onScan={handleScan}
          />
        )}
      </View>
    </>
  );
}
