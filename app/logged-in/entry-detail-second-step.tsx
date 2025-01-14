import { useIsFocused } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountModal from '~/components/modal/count-modal';
import { GroupedProductStorage } from '~/components/product-storage-list';
import Scanner from '~/components/scanner';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state';
import useCheckStorageExits from '~/lib/hooks/api/use-check-storage-exits';
import useEntryExitMove from '~/lib/hooks/api/use-entry-exit-move';
import useRecordDetail from '~/lib/hooks/api/use-record-detail';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { Entry, ProductSkuVariant, ToStringOrStringArray } from '~/lib/types';
import { cn, groupBy } from '~/lib/utils';

export default function DetailPageSecondPage() {
  const insets = useSafeAreaInsets();
  const entry = useLocalSearchParams<ToStringOrStringArray<{ id: string }>>();
  const entryId = Number(entry.id);
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchEntries,
  } = useRecordDetail<Entry>(entryId, 'entry');

  const [selectedProductSkuVariant, setSelectedProductSkuVariant] =
    useState<ProductSkuVariant>();
  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits();
  const { mutateAsync: mutateEntryMove } = useEntryExitMove();
  const { mutate: mutateChangeProductStorageState } =
    useChangeProductStorageState({ onSuccessCallback: refetchEntries });
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [storageSku, setStorageSku] = useState('');

  const { modal: countWarningModal, setOpen: openCountWarningModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('entry-detail.not-enough-items'),
      description: t('entry-detail.not-enough-items-description'),
    });

  const { modal: skuNotFoundModal, setOpen: openSkuNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('entry-detail.storage-not-found'),
      description: t('entry-detail.storage-to-not-found'),
    });

  const { modal: entryDoneModal, setOpen: openEntryDoneModal } =
    useNotificationModal({
      variant: 'default',
      title: t('entry-detail.entry-successful'),
      description: t('entry-detail.entry-successful-description'),
      onClose: () => {
        router.push({
          pathname: '/logged-in',
        });
      },
    });

  const { modal: entryErrorModal, setOpen: openEntryErrorModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('entry-detail.entry-error'),
      description: t('entry-detail.entry-error-description'),
    });

  const grouped = useMemo(
    () =>
      data?.productStorages
        ? groupBy(data?.productStorages, 'productSkuVariant.id')
        : {},
    [data],
  );
  const groupedProductStorages = useMemo(() => {
    return Object.entries(grouped).map(([_, groupOfProductStorages]) => {
      const uniqueProductStorage: GroupedProductStorage = {
        productStorage: groupOfProductStorages[0], // lets show just first one
        count: groupOfProductStorages.filter((storage) => storage.state).length,
        notMoved: groupOfProductStorages.filter(
          (item) => item.state !== 'moved',
        ).length,
        counted: groupOfProductStorages.filter(
          (storage) => storage.state === 'counted',
        ).length,
        allIds: groupOfProductStorages.map((ps) => ps.id),
      };
      return uniqueProductStorage;
    });
  }, [grouped]);

  if (isLoading || isRefetching)
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );

  const atLeasOneProductMoved = data?.productStorages?.find(
    (storage) => storage.state === 'moved',
  );

  return (
    <View className="container h-full px-2">
      <View className="m-2 flex flex-row gap-3">
        {selectedProductSkuVariant ? (
          <View className="flex-1">
            {isFocused && (
              <Scanner
                label={t('entry-detail.scan-storage')}
                mockData="newfancybox123"
                onScan={async (storageCode) => {
                  mutateCheckStorageExits({ sku: storageCode })
                    .then((resp) => {
                      setStorageSku(resp.sku);
                      setCountModalOpen(true);
                    })
                    .catch(openSkuNotFoundModal);
                }}
              />
            )}
          </View>
        ) : (
          <View className="flex-1">
            <Text className="text-center text-xl font-bold">
              {t('entry-detail.select-item')}
            </Text>
          </View>
        )}
      </View>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Table aria-labelledby="productstorage-table" className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">
                <Text className="text-md text-center font-bold">
                  {t('entry-detail.count')}
                </Text>
              </TableHead>
              <TableHead className="w-2/3">
                <Text className="text-md font-bold">
                  {t('entry-detail.product')}
                </Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <FlashList
              data={groupedProductStorages.filter(
                (item) => item.notMoved !== 0,
              )}
              estimatedItemSize={5}
              contentContainerStyle={{
                paddingBottom: insets.bottom,
              }}
              extraData={selectedProductSkuVariant}
              showsVerticalScrollIndicator={false}
              renderItem={({
                item: { productStorage, ...groupRest },
                index,
              }) => {
                return (
                  <TableRow
                    key={productStorage.id}
                    className={cn(
                      'w-full',
                      index % 2 && 'bg-muted/40',
                      selectedProductSkuVariant?.id ==
                        productStorage.productSkuVariant.id && 'bg-blue-100',
                    )}
                    onPress={() =>
                      setSelectedProductSkuVariant(
                        productStorage.productSkuVariant,
                      )
                    }
                  >
                    <TableCell className="w-1/3 items-center">
                      <Text>
                        {groupRest.counted}/{groupRest.notMoved}
                      </Text>
                    </TableCell>
                    <TableCell className="w-2/3">
                      <Text>{productStorage.productSkuVariant.name}</Text>
                    </TableCell>
                  </TableRow>
                );
              }}
            />
          </TableBody>
        </Table>
      </ScrollView>
      <CountModal
        open={countModalOpen && isFocused}
        setClose={() => {
          setCountModalOpen(false);
        }}
        productName={selectedProductSkuVariant?.name}
        onConfirm={(count) => {
          const productStoragesWithThisSkuVariantIds =
            data?.productStorages
              ?.filter(
                (productStorage) =>
                  productStorage.productSkuVariant.sku ===
                    selectedProductSkuVariant?.sku &&
                  productStorage.state === 'counted',
              )
              .map((item) => item.id) ?? [];
          if (productStoragesWithThisSkuVariantIds.length < count) {
            openCountWarningModal();
            return;
          }
          setSelectedProductSkuVariant(undefined);
          mutateChangeProductStorageState({
            change: 'moved',
            ids: productStoragesWithThisSkuVariantIds.slice(0, count),
            storageSku,
          });
          setCountModalOpen(false);
        }}
      />
      {countWarningModal}
      {skuNotFoundModal}
      {entryDoneModal}
      {entryErrorModal}
      {atLeasOneProductMoved && (
        <View className="absolute bottom-10 left-0 right-0 p-4">
          <Button
            className="w-full"
            onPress={() => {
              if (
                data?.productStorages?.every(
                  (storage) => storage.state === 'moved',
                )
              ) {
                mutateEntryMove({ type: 'entry', id: entryId })
                  .then(openEntryDoneModal)
                  .catch(openEntryErrorModal);
              } else {
                router.push({
                  pathname: '/logged-in',
                });
              }
            }}
          >
            <Text className="text-center">{t('entry-detail.finish')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
