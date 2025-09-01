import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, useWindowDimensions, View } from 'react-native';
import ExitWorkflow from '~/components/exit-work-flow/exit-work-flow';
import StatsTile from '~/components/exit-work-flow/stats-tile';
import { Text } from '~/components/ui/text';
import { buildProductPositionList, summarizeProductCounts } from '~/lib/exitDetailUtils';
import useGetStoredProductsQuery from '~/lib/hooks/api/use-get-stored-products-query';
import useRecordDetail from '~/lib/hooks/api/use-record-detail';
import {
  Exit,
  type ToStringOrStringArray
} from '~/lib/types';

export default function DetailPage() {
  const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
  const exitId = Number(exit.id);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const {
    data,
    isLoading: isLoadingRecordDetail,
    isRefetching: isRefetchingRecordDetail,
    refetch: refetchExit,
  } = useRecordDetail<Exit>(exitId, 'exit');

  const onlyNotDeletedProductStorages = useMemo(() => data?.productStorages?.filter((productStorage) => productStorage.deletedAt === null) ?? [], [data?.productStorages]);
  const alreadyMovedProductStorages = useMemo(() => onlyNotDeletedProductStorages.filter((productStorage) => productStorage.state === 'moved'), [onlyNotDeletedProductStorages]);
  const notMovedProductStorages = useMemo(() => onlyNotDeletedProductStorages.filter((productStorage) => productStorage.state !== 'moved'), [onlyNotDeletedProductStorages]);

  const summarizedProductCounts = useMemo(() => summarizeProductCounts(notMovedProductStorages), [notMovedProductStorages]);

  const { data: storedProducts, isLoading: isLoadingStoredProducts, isRefetching: isRefetchingStoredProducts } = useGetStoredProductsQuery({
    products: summarizedProductCounts,
    productExpirationDateMap: data?.productExpirationDateMap,
  }, { enabled: !!data?.productStorages });

  const productPositionList = useMemo(() => storedProducts ? buildProductPositionList(storedProducts) : [], [storedProducts]);

  const isLoading = isLoadingRecordDetail || isLoadingStoredProducts;
  const isRefetching = isRefetchingRecordDetail || isRefetchingStoredProducts;

  if (isLoading) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className={isLandscape ? "mb-3 flex-row items-center gap-4" : "mb-3"}>
        <Text className="text-xl font-bold">{data?.name}</Text>
        <Text className="text-sm text-neutral-500">{`Exit id: ${data?.id}`}</Text>
      </View>

      <View className={isLandscape ? "flex-row gap-4" : ""}>
        <View className={isLandscape ? "flex-col w-1/5 gap-y-3" : "flex-row gap-3"}>
          <StatsTile
            label="Presunuté položky"
            value={alreadyMovedProductStorages.length + '/' + onlyNotDeletedProductStorages.length}
            emoji="📦"
            isLandscape={isLandscape}
          />
          <StatsTile
            label="Produkty"
            value={summarizedProductCounts.length}
            emoji="🧾"
            isLandscape={isLandscape}
          />
          <StatsTile
            label="Pozície"
            value={productPositionList.length}
            emoji="📍"
            isLandscape={isLandscape}
          />
        </View>

        <View className={isLandscape ? "flex-1 ml-4" : ""}>
          <View
            className={`bg-neutral-200 dark:bg-neutral-800 ${isLandscape ? "w-[1px] mx-4" : "h-[1px] my-4"}`}
          />
          {productPositionList.length > 0 && <ExitWorkflow items={productPositionList} exitId={exitId} partnerId={data?.partnerId ?? 0} refetchExit={refetchExit} isRefetching={isRefetching} />}
        </View>
      </View>
    </ScrollView>
  );

}
