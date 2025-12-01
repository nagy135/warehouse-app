import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import Scanner from "~/components/scanner";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import useCheckInventoryBox, { InventoryProduct } from "~/lib/hooks/api/use-check-inventory-box";

interface ScanBoxStepProps {
  positionSku: string;
  onBoxScanned: (boxSku: string, boxId: string, products: InventoryProduct[]) => void;
}

export default function ScanBoxStep({ positionSku, onBoxScanned }: ScanBoxStepProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string>("");
  const [showWrongPositionAlert, setShowWrongPositionAlert] = useState(false);
  const [correctPositionName, setCorrectPositionName] = useState<string>("");
  const [pendingBoxSku, setPendingBoxSku] = useState<string>("");
  const [pendingBoxId, setPendingBoxId] = useState<string>("");
  const [pendingProducts, setPendingProducts] = useState<InventoryProduct[]>([]);

  const { mutateAsync: mutateCheckBox } = useCheckInventoryBox();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  function handleScan(scan: string) {
    setError("");
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
      })
  }

  function handleContinueFromAlert() {
    setShowWrongPositionAlert(false);
    onBoxScanned(pendingBoxSku, pendingBoxId, pendingProducts);
  }

  function handleCancelFromAlert() {
    setShowWrongPositionAlert(false);
    setPendingBoxSku("");
    setPendingBoxId("");
    setPendingProducts([]);
    setCorrectPositionName("");
  }

  return (
    <>
      {error && (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      )}

      {/* Wrong Position Alert */}
      {showWrongPositionAlert && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center z-50  p-4">
          <View className="bg-white p-6 rounded-lg max-w-md border-2 border-red-500">
            <Text className="text-lg font-bold mb-4">{t('inventory.wrong-position-title')}</Text>
            <Text className="mb-6">
              {t('inventory.wrong-position-message', { positionName: correctPositionName })}
            </Text>
            <View className="flex-row gap-4 justify-end">
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
        <Text className="text-center text-2xl mb-4">{t('inventory.scan-box')}</Text>
        {isFocused && !showWrongPositionAlert && (
          <Scanner
            mockData="SP944"
            label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? t('inventory.scan-box') : ''}
            onScan={handleScan}
          />
        )}
      </View>
    </>
  );
}
