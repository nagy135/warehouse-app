import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import Scanner from "~/components/scanner";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import useCheckInventoryPosition from "~/lib/hooks/api/use-check-inventory-position";
import useDeleteInventory from "~/lib/hooks/api/use-delete-inventory";

interface ScanPositionStepProps {
  onPositionScanned: (positionSku: string, positionId: string) => void;
}

export default function ScanPositionStep({ onPositionScanned }: ScanPositionStepProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showAlreadyInventoriedAlert, setShowAlreadyInventoriedAlert] = useState(false);
  const [alreadyInventoriedBoxName, setAlreadyInventoriedBoxName] = useState<string>("");
  const [pendingPositionSku, setPendingPositionSku] = useState<string>("");
  const [pendingPositionId, setPendingPositionId] = useState<string>("");

  const { mutateAsync: mutateCheckPosition } = useCheckInventoryPosition();
  const { mutateAsync: mutateDeleteInventory } = useDeleteInventory();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  function handleScan(scan: string) {
    setIsLoading(true);
    setError("");
    mutateCheckPosition({ sku: scan })
      .then((data) => {
        if (data.isPartOfInventory && data.box) {
          // Show alert and store pending data
          setPendingPositionSku(scan);
          setPendingPositionId(data.positionId);
          setAlreadyInventoriedBoxName(data.box.name);
          setShowAlreadyInventoriedAlert(true);
        } else {
          // Proceed directly
          onPositionScanned(scan, data.positionId);
        }
      })
      .catch(() => {
        setError(t('inventory.position-not-found'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleContinueFromAlert() {
    setIsLoading(true);
    setShowAlreadyInventoriedAlert(false);
    mutateDeleteInventory({ positionSku: pendingPositionSku })
      .then(() => {
        onPositionScanned(pendingPositionSku, pendingPositionId);
        setError("");
      })
      .catch(() => {
        setError(t('inventory.delete-error'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCancelFromAlert() {
    setShowAlreadyInventoriedAlert(false);
    setPendingPositionSku("");
    setPendingPositionId("");
    setAlreadyInventoriedBoxName("");
  }

  return (
    <>
      {error && (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      )}

      {/* Already Inventoried Alert */}
      {showAlreadyInventoriedAlert && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center z-50 bg-black/50 p-4">
          <View className="bg-white p-6 rounded-lg max-w-md">
            <Text className="text-lg font-bold mb-4">{t('inventory.already-inventoried-title')}</Text>
            <Text className="mb-6">
              {t('inventory.already-inventoried-message', { boxName: alreadyInventoriedBoxName })}
            </Text>
            <View className="flex-row gap-4 justify-end">
              <Button variant="outline" onPress={handleCancelFromAlert} disabled={isLoading}>
                <Text>{t('confirmation-modal.cancel')}</Text>
              </Button>
              <Button onPress={handleContinueFromAlert} disabled={isLoading}>
                <Text>{t('confirmation-modal.continue')}</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      <View>
        <Text className="text-center text-2xl mb-4">{t('inventory.scan-position')}</Text>
        {isFocused && !showAlreadyInventoriedAlert && (
          <Scanner
            mockData="Z1-AD-004-A"
            label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? t('inventory.scan-position') : ''}
            onScan={handleScan}
          />
        )}
      </View>
    </>
  );
}
