import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { InventoryProduct } from '~/lib/hooks/api/use-check-inventory-box';
import EnterQuantityMode from './EnterQuantityMode';
import ScanProductsMode, { ScannedProduct } from './ScanProductsMode';

type InventoryMode = 'enterQuantity' | 'scanProducts';

interface SelectModeStepProps {
  products: InventoryProduct[];
  scannedProducts: ScannedProduct[];
  onProductsChange: (products: InventoryProduct[]) => void;
  onScannedProductsChange: (products: ScannedProduct[]) => void;
  onSubmitEnterQuantity: () => void;
  onSubmitScanProducts: () => void;
}

export default function SelectModeStep({
  products,
  scannedProducts,
  onProductsChange,
  onScannedProductsChange,
  onSubmitEnterQuantity,
  onSubmitScanProducts,
}: SelectModeStepProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<InventoryMode>('enterQuantity');

  return (
    <ScrollView className="w-full flex-1">
      <View className="mb-4">
        <Text className="mb-2 text-center text-xl font-bold">
          {t('inventory.select-mode')}
        </Text>

        {/* Mode Switch */}
        <View className="mb-4 flex-row justify-center gap-2">
          <Button
            variant={mode === 'enterQuantity' ? 'default' : 'outline'}
            onPress={() => setMode('enterQuantity')}
            className="flex-1"
          >
            <Text>{t('inventory.mode-enter-quantity')}</Text>
          </Button>
          <Button
            variant={mode === 'scanProducts' ? 'default' : 'outline'}
            onPress={() => setMode('scanProducts')}
            className="flex-1"
          >
            <Text>{t('inventory.mode-scan-products')}</Text>
          </Button>
        </View>
      </View>

      {/* Mode A: Enter Quantity */}
      {mode === 'enterQuantity' && (
        <View className="w-full">
          <EnterQuantityMode
            products={products}
            onProductsChange={onProductsChange}
            onSubmit={onSubmitEnterQuantity}
          />
        </View>
      )}

      {/* Mode B: Scan Products */}
      {mode === 'scanProducts' && (
        <ScanProductsMode
          scannedProducts={scannedProducts}
          onScannedProductsChange={onScannedProductsChange}
          onSubmit={onSubmitScanProducts}
        />
      )}
    </ScrollView>
  );
}
