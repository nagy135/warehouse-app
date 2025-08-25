import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import ExitWorkflow from '~/components/exitWorkFlow/ExitWorkflow';
import StatsTile from '~/components/exitWorkFlow/StatsTile';
import ExitProductModal from '~/components/modal/exit-product-modal';
import ProductStorageList from '~/components/product-storage-list';
import Scanner from '~/components/scanner';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { buildProductPositionList, summarizeProductCounts } from '~/lib/exitDetailUtils';
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state';
import useEntryExitMove from '~/lib/hooks/api/use-entry-exit-move';
import useGetStoredProductsQuery from '~/lib/hooks/api/use-get-stored-products-query';
import useRecordDetail from '~/lib/hooks/api/use-record-detail';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import {
  EntryExitStatesEnum,
  Exit,
  ExitProductStepEnum,
  ProductStorage,
  type ToStringOrStringArray,
} from '~/lib/types';

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const exitId = Number(exit.id);
  const { t } = useTranslation();


  const {
    data,
    isLoading: isLoadingRecordDetail,
    isRefetching: isRefetchingRecordDetail,
    refetch: refetchExits,
  } = useRecordDetail<Exit>(exitId, 'exit');

  const summarizedProductCounts = useMemo(() => summarizeProductCounts(data?.productStorages ?? []), [data?.productStorages]);

  const { data: storedProducts, isLoading: isLoadingStoredProducts, isRefetching: isRefetchingStoredProducts } = useGetStoredProductsQuery({
    products: summarizedProductCounts,
    productExpirationDateMap: data?.productExpirationDateMap,
  }, { enabled: !!data?.productStorages });

  const productPositionList = useMemo(() => storedProducts ? buildProductPositionList(storedProducts) : [], [storedProducts]);

  const isLoading = isLoadingRecordDetail || isLoadingStoredProducts;
  const isRefetching = isRefetchingRecordDetail || isRefetchingStoredProducts;


  if (isLoading || isRefetching) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  }

  return (
    <View className="container h-full px-3 py-3">
      <View className="mb-3">
        <Text className="text-xl font-bold">{data?.name}</Text>
        <Text className="text-sm text-neutral-500">{`Exit id: ${data?.id}`}</Text>
      </View>

      <View className="flex-row gap-3">
        <StatsTile
          label="Položky"
          value={data?.productStorages?.length ?? 0}
          emoji="📦"
        />
        <StatsTile
          label="Produkty"
          value={summarizedProductCounts.length}
          emoji="🧾"
        />
        <StatsTile
          label="Pozície"
          value={productPositionList.length}
          emoji="📍"
        />
      </View>
      <View className="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-4" />
      <ExitWorkflow items={productPositionList} />
    </View>
  );

}
