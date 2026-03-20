import { checkStorageExitsResponse } from '~/lib/hooks/api/use-check-storage-exits';
import { useGroupedProducts } from './useGroupedProducts';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Input } from '../ui/input';
import { useState } from 'react';
import { GroupedProducts } from './useGroupedProducts';
import { useTranslation } from 'react-i18next';
import { formattedDate } from '~/lib/utils';

type Props = {
  productStoragesInBox: NonNullable<
    checkStorageExitsResponse['productStorages']
  >;
  onSubmit: (selectedProductStorageIds: number[]) => void;
};

export const SelectStorageItems = ({
  productStoragesInBox,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  const groupedProducts = useGroupedProducts(productStoragesInBox);
  const [selectedProductStorages, setSelectedProductStorages] =
    useState<GroupedProducts>(groupedProducts);

  const handleQuantityChange = (key: string, value: number) => {
    setSelectedProductStorages((prev) => {
      const newSelectedProductStorages = { ...prev };
      newSelectedProductStorages[key].count = value;
      return newSelectedProductStorages;
    });
  };

  const handleSubmit = () => {
    onSubmit(
      Object.values(selectedProductStorages)
        .map((product) => product.productStorageIds.slice(0, product.count))
        .flat()
        .map((id) => id),
    );
  };

  return (
    <View>
      {Object.values(groupedProducts).map((product) => {
        return (
          <View
            key={`enterQuantity_${product.key}`}
            className="mb-4 rounded border border-gray-300 p-3"
          >
            <View className="mb-2 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="font-bold">{product.name}</Text>
                {product.expirationDate && (
                  <Text className="text-sm">
                    {t('inventory.expiration-date')}:{' '}
                    {formattedDate(new Date(product.expirationDate))}
                  </Text>
                )}
                {product.batchNumber && (
                  <Text className="text-sm">
                    {t('inventory.batch-number')}: {product.batchNumber}
                  </Text>
                )}
              </View>
            </View>
            <View className="mt-2 flex-row items-center">
              <Text className="mr-2">{t('inventory.quantity')}:</Text>
              <Input
                className="flex-1 rounded-lg border border-neutral-300 p-2"
                keyboardType="numeric"
                value={product.count.toString()}
                onChangeText={(value) => {
                  if (isNaN(Number(value))) {
                    return;
                  }
                  handleQuantityChange(product.key, Number(value));
                }}
                placeholder="0"
              />
            </View>
          </View>
        );
      })}
      <View className="mb-4 mt-4 rounded bg-gray-100 p-3">
        <Text className="text-center text-lg font-bold">
          {t('move-section.number-selected-products', {
            count: Object.values(selectedProductStorages).reduce(
              (sum, product) => sum + product.count,
              0,
            ),
          })}
        </Text>
      </View>
      <Button onPress={handleSubmit} className="mt-4">
        <Text>{t('inventory.submit')}</Text>
      </Button>
    </View>
  );
};
