import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { Text } from "~/components/ui/text";
import { InventoryProduct } from "~/lib/hooks/api/use-check-inventory-box";
import useStoreInventory, { StoreInventoryItem } from "~/lib/hooks/api/use-store-inventory";
import ScanPositionStep from "./ScanPositionStep";
import ScanBoxStep from "./ScanBoxStep";
import SelectModeStep from "./SelectModeStep";
import { ScannedProduct } from "./ScanProductsMode";

type Step = "scanPosition" | "scanBox" | "selectMode";

export default function InventoryWorkflow() {
  const [step, setStep] = useState<Step>("scanPosition");

  const [scannedPositionSku, setScannedPositionSku] = useState<string>("");
  const [scannedPositionId, setScannedPositionId] = useState<string>("");
  const [scannedBoxSku, setScannedBoxSku] = useState<string>("");
  const [scannedBoxId, setScannedBoxId] = useState<string>("");

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { mutateAsync: mutateStoreInventory } = useStoreInventory();

  function resetToStart() {
    setStep("scanPosition");
    setScannedPositionSku("");
    setScannedPositionId("");
    setScannedBoxSku("");
    setScannedBoxId("");
    setProducts([]);
    setScannedProducts([]);
    setSuccessMessage("");
  }

  function handlePositionScanned(positionSku: string, positionId: string) {
    setScannedPositionSku(positionSku);
    setScannedPositionId(positionId);
    setStep("scanBox");
  }

  function handleBoxScanned(boxSku: string, boxId: string, boxProducts: InventoryProduct[]) {
    setScannedBoxSku(boxSku);
    setScannedBoxId(boxId);
    setProducts(boxProducts);
    setStep("selectMode");
  }

  function handleSubmitInventory(items: StoreInventoryItem[]) {
    setIsLoading(true);
    mutateStoreInventory({ items })
      .then(() => {
        setSuccessMessage(t('inventory.save-success'));
        setTimeout(() => {
          resetToStart();
        }, 1000);
      })
      .catch(() => {
        setError(t('inventory.save-error'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleSubmitEnterQuantity() {
    const items: StoreInventoryItem[] = products.map((product) => ({
      positionId: scannedPositionId,
      storageId: scannedBoxId,
      productId: product.id,
      expirationDate: product.expirationDate,
      batchNumber: product.batchNumber,
      count: product.count
    }));
    handleSubmitInventory(items);
  }

  function handleSubmitScanProducts() {
    const items: StoreInventoryItem[] = scannedProducts.map(product => ({
      positionId: scannedPositionId,
      storageId: scannedBoxId,
      productId: product.productId,
      expirationDate: product.expirationDate,
      batchNumber: product.batchNumber,
      count: product.count
    }));
    handleSubmitInventory(items);
  }

  return (
    <View className={`flex-1 ${isLandscape ? "p-2" : "p-4"}`}>
      {scannedPositionSku && (
        <View className="mb-4 bg-blue-100 p-2 rounded">
          <Text className="text-blue-600 font-bold text-center">{t('storages.position')}: {scannedPositionSku}</Text>
        </View>
      )}
      {scannedBoxSku && (
        <View className="mb-4 bg-blue-100 p-2 rounded">
          <Text className="text-blue-600 font-bold text-center">{t('move-section.storage')}: {scannedBoxSku}</Text>
        </View>
      )}

      {successMessage ? (
        <View className="mb-4 bg-green-100 p-2 rounded">
          <Text className="text-green-600 font-bold text-center">{successMessage}</Text>
        </View>
      ) : null}

      {error ? (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      ) : null}

      {isLoading && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center z-50 bg-white/50">
          <ActivityIndicator size={60} color="#666666" />
        </View>
      )}

      <View className="flex-1 items-center justify-center">
        {step === "scanPosition" && (
          <ScanPositionStep onPositionScanned={handlePositionScanned} />
        )}

        {step === "scanBox" && (
          <ScanBoxStep
            positionSku={scannedPositionSku}
            onBoxScanned={handleBoxScanned}
          />
        )}

        {step === "selectMode" && (
          <SelectModeStep
            products={products}
            scannedProducts={scannedProducts}
            onProductsChange={setProducts}
            onScannedProductsChange={setScannedProducts}
            onSubmitEnterQuantity={handleSubmitEnterQuantity}
            onSubmitScanProducts={handleSubmitScanProducts}
          />
        )}
      </View>
    </View>
  );
}
