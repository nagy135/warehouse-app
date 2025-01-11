import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { ProductStorage } from '~/lib/types';
import { cn, groupBy } from '~/lib/utils';
import { ScannedProductStorages } from './scan-products';

export const MIN_COLUMN_WIDTHS = [40, 40, 120, 120];

export type GroupedProductStorage = {
  productStorage: ProductStorage;
  productStorages?: ProductStorage[];
  count: number;
};

export default function ExitProductStorageList({
  data,
  scannedProductStorages,
}: {
  data: ProductStorage[];
  scannedProductStorages: ScannedProductStorages[];
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const grouped = useMemo(() => groupBy(data, 'productSkuVariant.id'), [data]);

  const groupedProductStorages = useMemo(() => {
    return Object.entries(grouped).map(([_, groupOfProductStorages]) => {
      const uniqueProductStorage: GroupedProductStorage = {
        productStorage: groupOfProductStorages[0],
        productStorages: groupOfProductStorages,
        count: groupOfProductStorages.length,
      };
      return uniqueProductStorage;
    });
  }, [grouped]);

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return evenWidth > minWidth ? evenWidth : minWidth;
    });
  }, [width]);

  return (
    <>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
      >
        <Table aria-labelledby="productstorage-table">
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: columnWidths[0] }}>
                <Text className="text-md text-center font-bold">
                  {t('count')}
                </Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[1] }}>
                <Text className="text-md text-center font-bold">
                  {t('product-storage-list.scanned')}
                </Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[2] }}>
                <Text className="text-md font-bold">
                  {t('product-storage-list.variant_name')}
                </Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[3] }}>
                <Text className="text-md font-bold">
                  {t('product-storage-list.sku')}
                </Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <FlashList
              data={groupedProductStorages}
              estimatedItemSize={5}
              contentContainerStyle={{
                paddingBottom: insets.bottom,
              }}
              extraData={scannedProductStorages}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: { productStorage, count }, index }) => {
                const scannedCount =
                  scannedProductStorages.find(
                    (scannedProductStorage) =>
                      scannedProductStorage.productSkuVariantId ===
                      productStorage.productSkuVariantId,
                  )?.count ?? 0;
                return (
                  <TableRow
                    key={productStorage.id}
                    className={cn(
                      'active:bg-secondary',
                      index % 2 && 'bg-muted/40',
                      scannedCount === count && 'bg-green-100',
                    )}
                  >
                    <TableCell style={{ width: columnWidths[0] }}>
                      <Text>{count}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[1] }}>
                      <Text>{scannedCount}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[2] }}>
                      <Text>{productStorage.productSkuVariant.name}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[3] }}>
                      <Text>{productStorage.productSkuVariant.sku}</Text>
                    </TableCell>
                  </TableRow>
                );
              }}
              ListFooterComponent={() => {
                return (
                  <>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="justify-center">
                          <Text className="text-foreground">
                            <Text className="font-bold">{t('total')} </Text>
                            {data.length}
                          </Text>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                    <View className="ios:pb-0 items-center py-3">
                      <Text
                        nativeID="invoice-table"
                        className="items-center text-sm text-muted-foreground"
                      >
                        {t('product-storage-list.list')}
                      </Text>
                    </View>
                  </>
                );
              }}
            />
          </TableBody>
        </Table>
      </ScrollView>
    </>
  );
}
