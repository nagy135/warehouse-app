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
  hasExpirationDate: boolean;
  hasBatchNumber: boolean;
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
  const [tempExpirationDate, setTempExpirationDate] = useState<string>("");
  const [tempBatchNumber, setTempBatchNumber] = useState<string>("");
  const [hasExpirationDate, setHasExpirationDate] = useState<boolean>(false);
  const [hasBatchNumber, setHasBatchNumber] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [editExpirationDate, setEditExpirationDate] = useState<string>("");
  const [editBatchNumber, setEditBatchNumber] = useState<string>("");
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editSelectedDate, setEditSelectedDate] = useState<Date>(new Date());

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

        // Check if this product was already scanned and auto-fill from previous entry
        const existingProduct = [...scannedProducts].reverse().find(p => p.productId === data.id);
        if (existingProduct) {
          setTempExpirationDate(existingProduct.expirationDate || "");
          setTempBatchNumber(existingProduct.batchNumber || "");
          if (existingProduct.expirationDate) {
            setSelectedDate(new Date(existingProduct.expirationDate));
          }
        } else {
          setTempExpirationDate("");
          setTempBatchNumber("");
        }

        // Auto-add if product has no expiration date and no batch number
        if (!data.hasExpirationDate && !data.hasBatchNumber) {
          addProductToList(data.id, data.name, "", "");
        }
      })
      .catch(() => {
        setError(t('inventory.product-not-found'));
      })
  }

  function handleAddProduct() {
    if (hasExpirationDate && !tempExpirationDate) {
      setError(t('inventory.expiration-date-required'));
      return;
    }

    addProductToList(currentScannedProductId, currentScannedProductName, tempExpirationDate, tempBatchNumber);
  }

  function addProductToList(productId: string, productName: string, expirationDate: string, batchNumber: string) {
    // Check if product with same ID, expiration date, and batch number already exists
    const existingProductIndex = scannedProducts.findIndex(
      (p) =>
        p.productId === productId &&
        p.expirationDate === expirationDate &&
        p.batchNumber === batchNumber
    );

    if (existingProductIndex !== -1) {
      // Product exists, increment count
      const updatedProducts = [...scannedProducts];
      updatedProducts[existingProductIndex].count += 1;
      onScannedProductsChange(updatedProducts);
    } else {
      // New product, add with count of 1
      const newProduct: ScannedProduct = {
        productId: productId,
        productName: productName,
        expirationDate: expirationDate,
        batchNumber: batchNumber,
        hasExpirationDate: hasExpirationDate,
        hasBatchNumber: hasBatchNumber,
        count: 1
      };
      onScannedProductsChange([...scannedProducts, newProduct]);
    }

    setCurrentScannedProductId("");
    setCurrentScannedProductName("");
    setTempExpirationDate("");
    setHasExpirationDate(false);
    setHasBatchNumber(false);
    setTempBatchNumber("");
    setError("");
    setHasExpirationDate(false);
    setHasBatchNumber(false);
  }

  function handleRemoveProduct(index: number) {
    onScannedProductsChange(scannedProducts.filter((_, i) => i !== index));
  }

  function handleEditProduct(index: number) {
    const product = scannedProducts[index];
    setEditingIndex(index);
    setEditQuantity(product.count.toString());
    setEditExpirationDate(product.expirationDate || "");
    setEditBatchNumber(product.batchNumber || "");
    if (product.expirationDate) {
      setEditSelectedDate(new Date(product.expirationDate));
    }
  }

  function handleSaveEdit() {
    if (editingIndex === null) return;

    const quantity = parseInt(editQuantity, 10);
    if (!editQuantity || quantity <= 0) {
      setError(t('inventory.invalid-quantity'));
      return;
    }

    const product = scannedProducts[editingIndex];

    // Check if product has expiration date requirement
    const productHasExpirationDate = scannedProducts.some(
      p => p.productId === product.productId && p.expirationDate
    ) || product.expirationDate;

    if (productHasExpirationDate && !editExpirationDate) {
      setError(t('inventory.expiration-date-required'));
      return;
    }

    const updatedProducts = [...scannedProducts];
    updatedProducts[editingIndex] = {
      ...product,
      count: quantity,
      expirationDate: editExpirationDate,
      batchNumber: editBatchNumber,
    };

    onScannedProductsChange(updatedProducts);
    setEditingIndex(null);
    setEditQuantity("");
    setEditExpirationDate("");
    setEditBatchNumber("");
    setError("");
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditQuantity("");
    setEditExpirationDate("");
    setEditBatchNumber("");
    setError("");
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
              mockData={'9874510517157'}
            />
          )}
        </View>
      ) : (
        <View>
          <Text className="text-lg font-bold mb-2">{currentScannedProductName}</Text>

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

                      // Auto-add if product has no batch number requirement
                      if (!hasBatchNumber) {
                        addProductToList(currentScannedProductId, currentScannedProductName, formattedDateStr, "");
                      }
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

          {(hasExpirationDate || hasBatchNumber) && (
            <Button onPress={handleAddProduct} className="mb-4">
              <Text>{t('inventory.add-product')}</Text>
            </Button>
          )}
        </View>
      )}

      {/* List of scanned products */}
      {scannedProducts.length > 0 && (
        <View className="mt-4">
          <Text className="text-lg font-bold mb-2">{t('inventory.scanned-products-list')}</Text>
          {scannedProducts.map((product, index) => (
            <View key={index} className="mb-2 p-3 border border-gray-300 rounded">
              {editingIndex === index ? (
                <View>
                  <Text className="font-bold mb-2">{product.productName}</Text>

                  <View className="mb-3">
                    <Text className="mb-1">{t('inventory.quantity')}:</Text>
                    <Input
                      className="border border-neutral-300 rounded-lg p-2"
                      keyboardType="numeric"
                      value={editQuantity}
                      onChangeText={setEditQuantity}
                      placeholder="0"
                    />
                  </View>

                  {product.hasExpirationDate && (
                    <View className="mb-3">
                      <Text className="mb-1">{t('inventory.expiration-date')}:</Text>
                      <TouchableOpacity
                        onPress={() => setShowEditDatePicker(true)}
                        className="border border-neutral-300 rounded-lg p-2 bg-white"
                      >
                        <Text className={editExpirationDate ? "text-black" : "text-gray-400"}>
                          {editExpirationDate ? formattedDate(new Date(editExpirationDate)) : "YYYY-MM-DD"}
                        </Text>
                      </TouchableOpacity>
                      {editExpirationDate && (
                        <TouchableOpacity onPress={() => setEditExpirationDate("")} className="mt-1">
                          <Text className="text-blue-600">{t('inventory.clear-date')}</Text>
                        </TouchableOpacity>
                      )}
                      {showEditDatePicker && (
                        <DateTimePicker
                          value={editSelectedDate}
                          mode="date"
                          display="default"
                          onChange={(event: any, date?: Date) => {
                            setShowEditDatePicker(false);
                            if (event.type === 'set' && date) {
                              date?.setHours(12);
                              setEditSelectedDate(date);
                              const formattedDateStr = date.toISOString().split('T')[0];
                              setEditExpirationDate(formattedDateStr);
                            }
                          }}
                        />
                      )}
                    </View>
                  )}
                  {product.hasBatchNumber && (
                    <View className="mb-3">
                      <Text className="mb-1">{t('inventory.batch-number')} ({t('inventory.optional')}):</Text>
                      <Input
                        className="border border-neutral-300 rounded-lg p-2"
                        value={editBatchNumber}
                        onChangeText={setEditBatchNumber}
                        placeholder=""
                      />
                    </View>
                  )}

                  <View className="flex-row gap-2">
                    <Button onPress={handleSaveEdit} className="flex-1">
                      <Text>{t('inventory.save')}</Text>
                    </Button>
                    <Button onPress={handleCancelEdit} className="flex-1 bg-gray-500">
                      <Text>{t('inventory.cancel')}</Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-bold">{product.productName}</Text>
                    <Text className="text-sm">{t('inventory.quantity')}: {product.count}</Text>
                    {product.expirationDate && (
                      <Text className="text-sm">{t('inventory.expiration-date')}: {formattedDate(new Date(product.expirationDate))}</Text>
                    )}
                    {product.batchNumber && (
                      <Text className="text-sm">{t('inventory.batch-number')}: {product.batchNumber}</Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleEditProduct(index)} className="px-2">
                      <Text className="text-blue-600 font-bold text-lg">✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveProduct(index)} className="px-2">
                      <Text className="text-red-600 font-bold text-lg">✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          <View className="mt-4 mb-4 p-3 bg-gray-100 rounded">
            <Text className="text-lg font-bold text-center">
              {t('inventory.number-of-products', { count: scannedProducts.reduce((sum, product) => sum + product.count, 0) })}
            </Text>
          </View>
          <Button onPress={handleSubmit} className="mt-4">
            <Text>{t('inventory.submit')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
