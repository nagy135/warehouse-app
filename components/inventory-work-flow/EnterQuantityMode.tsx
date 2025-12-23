import React, { useCallback, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { InventoryProduct } from "~/lib/hooks/api/use-check-inventory-box";
import { formattedDate } from "~/lib/utils";
import { useFocusEffect } from "expo-router";
import useCheckProductSku from "~/lib/hooks/api/use-check-product-sku";

interface EnterQuantityModeProps {
  products: InventoryProduct[];
  onProductsChange: (products: InventoryProduct[]) => void;
  onSubmit: () => void;
}

export default function EnterQuantityMode({
  products,
  onProductsChange,
  onSubmit,
}: EnterQuantityModeProps) {
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
  const [editingExpirationDateIndex, setEditingExpirationDateIndex] = useState<number | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const { mutateAsync: mutateCheckProductSku } = useCheckProductSku();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  function handleQuantityChange(index: number, value: string) {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      count: parseInt(value, 10) || 0
    };
    onProductsChange(newProducts);
  }

  function handleRemoveProduct(index: number) {
    onProductsChange(products.filter((_, i) => i !== index));
  }

  function handleExpirationDateChange(index: number, date: Date) {
    const newProducts = [...products];
    const formattedDateStr = date.toISOString().split('T')[0];
    newProducts[index] = {
      ...newProducts[index],
      expirationDate: formattedDateStr
    };
    onProductsChange(newProducts);
    setEditingExpirationDateIndex(null);
    setShowEditDatePicker(false);
  }

  function handleStartEditExpirationDate(index: number) {
    const product = products[index];
    setEditingExpirationDateIndex(index);
    setShowEditDatePicker(true);
  }

  function handleClearExpirationDate(index: number) {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      expirationDate: undefined
    };
    onProductsChange(newProducts);
  }

  function handleSubmit() {
    // Check if any product that requires expiration date is missing it
    const productsWithMissingExpirationDate = products.filter((product) => {
      // If hasExpirationDate is true, expirationDate must be present
      if (product.hasExpirationDate && !product.expirationDate) {
        return true;
      }
      return false;
    });

    if (productsWithMissingExpirationDate.length > 0) {
      setError(t('inventory.missing-expiration-date'));
      return;
    }

    setError("");
    onSubmit();
  }

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

    const newProduct: InventoryProduct = {
      id: currentScannedProductId,
      name: currentScannedProductName,
      expirationDate: tempExpirationDate,
      batchNumber: tempBatchNumber,
      count: parseInt(tempQuantity, 10),
      hasExpirationDate: hasExpirationDate,
      hasBatchNumber: hasBatchNumber
    };

    onProductsChange([...products, newProduct]);
    setCurrentScannedProductId("");
    setCurrentScannedProductName("");
    setTempQuantity("");
    setTempExpirationDate("");
    setTempBatchNumber("");
    setError("");
    setHasExpirationDate(false);
    setHasBatchNumber(false);
  }

  if (currentScannedProductId) {
    return (
      <View>
        {error && (
          <View className="mb-4 bg-red-100 p-2 rounded">
            <Text className="text-red-600 font-bold text-center">{error}</Text>
          </View>
        )}

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
    );
  }

  return (
    <View>
      {error && (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      )}

      <Text className="text-lg font-bold mb-2">{t('inventory.products-list')}</Text>
      {products.map((product, index) => {
        const isEditingExpirationDate = editingExpirationDateIndex === index;
        return (
          <View key={`enterQuantity_${index}`} className="mb-4 p-3 border border-gray-300 rounded">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="font-bold">{product.name}</Text>
                {(product.hasExpirationDate) && (
                  <View className="mt-2">
                    <Text className="mb-1 text-sm">{t('inventory.expiration-date')}:</Text>
                    {product.hasExpirationDate ? (
                      <View className="flex-row items-center flex-wrap">
                        <Text className={`text-sm mr-2 ${!product.expirationDate ? 'text-red-600' : ''}`}>{product.expirationDate ? formattedDate(new Date(product.expirationDate)) : "YYYY-MM-DD"}</Text>
                        <TouchableOpacity onPress={() => handleStartEditExpirationDate(index)}>
                          <Text className="text-blue-600 text-sm">{t('inventory.edit')}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleStartEditExpirationDate(index)}
                        className="border border-neutral-300 rounded-lg p-2 bg-white"
                      >
                        <Text className="text-gray-400">YYYY-MM-DD</Text>
                      </TouchableOpacity>
                    )}
                    {isEditingExpirationDate && showEditDatePicker && (
                      <DateTimePicker
                        value={product.expirationDate ? new Date(product.expirationDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event: any, date?: Date) => {
                          setShowEditDatePicker(false);
                          if (event.type === 'set' && date) {
                            date?.setHours(12);
                            handleExpirationDateChange(index, date);
                          } else if (event.type === 'dismissed') {
                            setEditingExpirationDateIndex(null);
                            setShowEditDatePicker(false);
                          }
                        }}
                      />
                    )}
                  </View>
                )}
                {product.batchNumber && (
                  <Text className="text-sm">{t('inventory.batch-number')}: {product.batchNumber}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                <Text className="text-red-600 font-bold text-xl">✕</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="mr-2">{t('inventory.quantity')}:</Text>
              <Input
                className="border border-neutral-300 rounded-lg p-2 flex-1"
                keyboardType="numeric"
                value={product.count.toString()}
                onChangeText={(value) => handleQuantityChange(index, value)}
                placeholder="0"
              />
            </View>
          </View>
        );
      })}

      <View className="mb-4">
        <Text className="text-center text-lg mb-2">{t('inventory.scan-product')}</Text>
        {isFocused && (
          <Scanner
            label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? t('inventory.scan-product') : ''}
            onScan={handleScanProduct}
            mockData={'2255489247417'}
          />
        )}
      </View>
      <View className="mt-4 mb-4 p-3 bg-gray-100 rounded">
        <Text className="text-lg font-bold text-center">
          {t('inventory.number-of-products', { count: products.reduce((sum, product) => sum + product.count, 0) })}
        </Text>
      </View>
      <Button onPress={handleSubmit} className="mt-4">
        <Text>{t('inventory.submit')}</Text>
      </Button>
    </View>
  );
}
