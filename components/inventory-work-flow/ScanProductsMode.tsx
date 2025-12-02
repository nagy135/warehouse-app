import React, { useCallback, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { formattedDate } from "~/lib/utils";
import { useFocusEffect } from "expo-router";
import useCheckProductSku from "~/lib/hooks/api/use-check-product-sku";

export type ScannedProduct = {
  productId: string;
  productName: string;
  expirationDate: string;
  batchNumber: string;
  count: number;
};

interface ScanProductsModeProps {
  scannedProducts: ScannedProduct[];
  onScannedProductsChange: (products: ScannedProduct[]) => void;
  onSubmit: () => void;
}

export default function ScanProductsMode({
  scannedProducts,
  onScannedProductsChange,
  onSubmit,
}: ScanProductsModeProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentScannedProductId, setCurrentScannedProductId] = useState<string>("");
  const [currentScannedProductName, setCurrentScannedProductName] = useState<string>("");
  const [tempQuantity, setTempQuantity] = useState<string>("");
  const [tempExpirationDate, setTempExpirationDate] = useState<string>("");
  const [tempBatchNumber, setTempBatchNumber] = useState<string>("");
  const [hasExpirationDate, setHasExpirationDate] = useState<boolean>(false);
  const [hasBatchNumber, setHasBatchNumber] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { mutateAsync: mutateCheckProductSku } = useCheckProductSku();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  function handleScanProduct(scan: string) {
    setError("");
    mutateCheckProductSku({ sku: scan })
      .then((data) => {
        setCurrentScannedProductId(data.id);
        setCurrentScannedProductName(data.name);
        setHasExpirationDate(data.hasExpirationDate);
        setHasBatchNumber(data.hasBatchNumber);
        setTempQuantity("");
        setTempExpirationDate("");
        setTempBatchNumber("");
      })
      .catch(() => {
        setError(t('inventory.product-not-found'));
      })
  }

  function handleAddProduct() {
    if (!tempQuantity || parseInt(tempQuantity, 10) <= 0) {
      setError(t('inventory.invalid-quantity'));
      return;
    }

    if (hasExpirationDate && !tempExpirationDate) {
      setError(t('inventory.expiration-date-required'));
      return;
    }

    const newProduct: ScannedProduct = {
      productId: currentScannedProductId,
      productName: currentScannedProductName,
      expirationDate: tempExpirationDate,
      batchNumber: tempBatchNumber,
      count: parseInt(tempQuantity, 10)
    };

    onScannedProductsChange([...scannedProducts, newProduct]);
    setCurrentScannedProductId("");
    setCurrentScannedProductName("");
    setTempQuantity("");
    setTempExpirationDate("");
    setTempBatchNumber("");
    setError("");
    setHasExpirationDate(false);
    setHasBatchNumber(false);
  }

  function handleRemoveProduct(index: number) {
    onScannedProductsChange(scannedProducts.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (scannedProducts.length === 0) {
      setError(t('inventory.no-products-scanned'));
      return;
    }
    onSubmit();
  }

  return (
    <View className="w-full">
      {error && (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      )}

      {!currentScannedProductId ? (
        <View>
          <Text className="text-center text-lg mb-4">{t('inventory.scan-product')}</Text>
          {isFocused && (
            <Scanner
              label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? t('inventory.scan-product') : ''}
              onScan={handleScanProduct}
              mockData={'5060180819736'}
            />
          )}
        </View>
      ) : (
        <View>
          <Text className="text-lg font-bold mb-2">{currentScannedProductName}</Text>

          <View className="mb-3">
            <Text className="mb-1">{t('inventory.quantity')}:</Text>
            <Input
              className="border border-neutral-300 rounded-lg p-2"
              keyboardType="numeric"
              value={tempQuantity}
              onChangeText={setTempQuantity}
              placeholder="0"
            />
          </View>

          {hasExpirationDate && (
            <View className="mb-3">
              <Text className="mb-1">{t('inventory.expiration-date')}:</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border border-neutral-300 rounded-lg p-2 bg-white"
              >
                <Text className={tempExpirationDate ? "text-black" : "text-gray-400"}>
                  {tempExpirationDate ? formattedDate(new Date(tempExpirationDate)) : "YYYY-MM-DD"}
                </Text>
              </TouchableOpacity>
              {tempExpirationDate && (
                <TouchableOpacity onPress={() => setTempExpirationDate("")} className="mt-1">
                  <Text className="text-blue-600">{t('inventory.clear-date')}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event: any, date?: Date) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && date) {
                      date?.setHours(12);
                      setSelectedDate(date);
                      const formattedDateStr = date.toISOString().split('T')[0];
                      setTempExpirationDate(formattedDateStr);
                    }
                  }}
                />
              )}
            </View>
          )}

          {hasBatchNumber && (
            <View className="mb-3">
              <Text className="mb-1">{t('inventory.batch-number')} ({t('inventory.optional')}):</Text>
              <Input
                className="border border-neutral-300 rounded-lg p-2"
                value={tempBatchNumber}
                onChangeText={setTempBatchNumber}
                placeholder=""
              />
            </View>
          )}

          <Button onPress={handleAddProduct} className="mb-4">
            <Text>{t('inventory.add-product')}</Text>
          </Button>
        </View>
      )}

      {/* List of scanned products */}
      {scannedProducts.length > 0 && (
        <View className="mt-4">
          <Text className="text-lg font-bold mb-2">{t('inventory.scanned-products-list')}</Text>
          {scannedProducts.map((product, index) => (
            <View key={index} className="mb-2 p-3 border border-gray-300 rounded flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-bold">{product.productName}</Text>
                <Text className="text-sm">{t('inventory.quantity')}: {product.count}</Text>
                {product.expirationDate && (
                  <Text className="text-sm">{t('inventory.expiration-date')}: {product.expirationDate}</Text>
                )}
                {product.batchNumber && (
                  <Text className="text-sm">{t('inventory.batch-number')}: {product.batchNumber}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                <Text className="text-red-600 font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Button onPress={handleSubmit} className="mt-4">
            <Text>{t('inventory.submit')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
