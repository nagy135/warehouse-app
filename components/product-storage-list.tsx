import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
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
import { cn, groupBy } from '~/lib/utils';
import { EntryExitStatesEnum, ProductStorage } from '~/lib/types';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Button } from './ui/button';
import ConfirmationModal from './modal/confirmation-modal';
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state';
import {
  PagesStateActions,
  usePageStateContext,
} from '~/app/contexts/PageStateContext';
import { useTranslation } from 'react-i18next';

export const MIN_COLUMN_WIDTHS = [100, 120, 120, 140, 100];

export type GroupedProductStorage = {
  productStorage: ProductStorage;
  productStorages?: ProductStorage[];
  count: number;
  counted: number;
  moved?: number;
  notMoved?: number;
  allIds: number[];
  positions?: string[];
};

export default function ProductStorageList({
  data,
  refetchProductStorages,
  variant,
  state,
  exitName,
}: {
  data: ProductStorage[];
  refetchProductStorages: () => void;
  variant: 'entry' | 'exit';
  state: EntryExitStatesEnum;
  exitName?: string;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { dispatch } = usePageStateContext();
  const { t } = useTranslation();

  const grouped = useMemo(() => groupBy(data, 'productSkuVariant.id'), [data]);
  const groupedProductStorages = useMemo(() => {
    return Object.entries(grouped).map(([_, groupOfProductStorages]) => {
      const uniqueProductStorage: GroupedProductStorage = {
        productStorage: groupOfProductStorages[0],
        productStorages: groupOfProductStorages,
        count: groupOfProductStorages.length,
        moved: groupOfProductStorages.filter((item) => item.state === 'moved')
          .length,
        notMoved: groupOfProductStorages.filter(
          (item) => item.state !== 'moved',
        ).length,
        counted: groupOfProductStorages.filter(
          (item) => item.state === 'counted',
        ).length,
        positions: [
          ...new Set(
            groupOfProductStorages.map(
              (item) => item.storage.position?.name ?? '',
            ),
          ),
        ],
        allIds: groupOfProductStorages.map((ps) => ps.id),
      };
      return uniqueProductStorage;
    });
  }, [grouped]);

  const { mutate: mutateChangeProductStorageState } =
    useChangeProductStorageState({ onSuccessCallback: refetchProductStorages });

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
              {variant === 'entry' && (
                <TableHead style={{ width: columnWidths[0] }}>
                  <Text className="text-md text-center font-bold">
                    {t('product-storage-list.scanned')}
                  </Text>
                </TableHead>
              )}
              <TableHead style={{ width: columnWidths[0] }}>
                <Text className="text-md text-center font-bold">
                  {t('product-storage-list.moved')}
                </Text>
              </TableHead>
              {variant === 'exit' && (
                <TableHead style={{ width: columnWidths[1] }}>
                  <Text className="text-md font-bold">
                    {t('product-storage-list.positions')}
                  </Text>
                </TableHead>
              )}
              <TableHead style={{ width: columnWidths[1] }}>
                <Text className="text-md font-bold">
                  {t('product-storage-list.variant_name')}
                </Text>
              </TableHead>
              <TableHead
                className="text-lg font-bold"
                style={{ width: columnWidths[2] }}
              >
                <Text className="text-md font-bold">
                  {t('product-storage-list.change')}
                </Text>
              </TableHead>

              <TableHead
                className="text-lg font-bold"
                style={{ width: columnWidths[4] }}
              >
                <Text className="text-md font-bold"></Text>
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
              showsVerticalScrollIndicator={false}
              renderItem={({
                item: { productStorage, productStorages, ...groupRest },
                index,
              }) => {
                return (
                  <TableRow
                    key={productStorage.id}
                    className={cn(
                      'active:bg-secondary',
                      index % 2 && 'bg-muted/40',
                      (groupRest.notMoved === 0 ||
                        state === EntryExitStatesEnum.MOVED) &&
                        'bg-green-100',
                    )}
                    onPress={() => {
                      const group =
                        grouped[productStorage.productSkuVariant.id];
                      const storageIds = group.map((ps) => ps.storage.id);

                      if (variant === 'exit') {
                        dispatch({
                          type: PagesStateActions.SET_PRODUCT_STORAGES,
                          value: productStorages || [],
                        });
                        router.push({
                          /* @ts-ignore */
                          pathname: '/logged-in/storages-group',
                          params: { storageIds, exitName },
                        });
                      }
                    }}
                  >
                    {variant === 'entry' && (
                      <TableCell
                        style={{ width: columnWidths[0] }}
                        className="items-center"
                      >
                        <Text>
                          {groupRest.notMoved === 0 ||
                          state === EntryExitStatesEnum.MOVED
                            ? ''
                            : `${groupRest.counted}/${groupRest.notMoved}`}
                        </Text>
                      </TableCell>
                    )}
                    <TableCell
                      style={{ width: columnWidths[0] }}
                      className="items-center"
                    >
                      <Text>
                        {state === EntryExitStatesEnum.MOVED
                          ? groupRest.count
                          : groupRest.moved}
                        /{groupRest.count}
                      </Text>
                    </TableCell>
                    {variant === 'exit' && (
                      <TableCell style={{ width: columnWidths[1] }}>
                        <Text>
                          {groupRest.positions?.map(
                            (position, index) =>
                              `${index === 0 ? '' : ', '}${position}`,
                          )}
                        </Text>
                      </TableCell>
                    )}
                    <TableCell
                      className="items-end"
                      style={{ width: columnWidths[1] }}
                    >
                      <Text>{productStorage.productSkuVariant.name}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[2] }}>
                      <Text>
                        {productStorage.productSkuVariant.productCV.name}
                      </Text>
                    </TableCell>
                    <TableCell
                      style={{ width: columnWidths[4] }}
                      className="items-end"
                    >
                      <ConfirmationModal
                        button={
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mr-3 shadow-sm shadow-foreground/10"
                          >
                            <Text>reset</Text>
                          </Button>
                        }
                        title="Reset"
                        description={t(
                          'product-storage-list.reset_confirmation',
                        )}
                        onConfirm={() => {
                          mutateChangeProductStorageState({
                            ids: groupRest.allIds,
                            change: 'none',
                          });
                        }}
                      />
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
                            <Text className="font-bold">
                              {t('product-storage-list.total')}:{' '}
                            </Text>
                            {`${groupedProductStorages.reduce((prev, next) => prev + next.count, 0)}`}
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
