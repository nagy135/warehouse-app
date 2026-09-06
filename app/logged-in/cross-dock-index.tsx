import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  ViewToken,
} from 'react-native';
import CrossDockCard from '~/components/cross-dock/card';
import RedirectModal from '~/components/modal/redirect-modal';
import Scanner from '~/components/scanner';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import useFindCrossDockBySku from '~/lib/hooks/api/use-find-cross-dock-by-sku';
import useGetCrossDockRecords from '~/lib/hooks/api/use-get-cross-dock-records';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { CrossDock, Partner, Delivery } from '~/lib/types';
import useGetPartners from '~/lib/hooks/api/use-get-partners';
import useGetDeliveries from '~/lib/hooks/api/use-get-deliveries';
import { Dropdown } from '~/components/ui/dropdown';
import {
  usePageStateContext,
  PagesStateActions,
} from '../contexts/PageStateContext';

export default function CrossDockPage() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { state, dispatch } = usePageStateContext();
  const [foundCrossDock, setFoundCrossDock] = useState<CrossDock | null>(null);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lastVisibleId, setLastVisibleId] = useState<number | null>(null);

  const { t } = useTranslation();
  const { mutateAsync: findCrossDockBySku } = useFindCrossDockBySku();
  const { setOpen: notificationModalOpen, modal: notificationModal } =
    useNotificationModal({
      title: t('not-found-title'),
      description: t('cross-dock-list.not-found'),
    });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const {
    data: crossDocks,
    isWaiting,
    isLoading,
    error,
    refreshing,
    onRefresh,
    fetchNextPage,
    hasNextPage,
  } = useGetCrossDockRecords<CrossDock>({
    search: debouncedSearch,
    partner: state.selectedPartner ?? undefined,
    delivery: state.selectedDelivery ?? undefined,
  });

  const { data: partners } = useGetPartners();
  const { data: deliveries } = useGetDeliveries();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const renderItem = useCallback(
    ({ item }: { item: CrossDock }) => (
      <View className="my-1">
        <CrossDockCard
          crossDock={item}
          delivery={
            deliveries?.find((delivery) => delivery.id === item.deliveryId)
              ?.name ?? ''
          }
          partner={
            partners?.find((partner) => partner.id === item.partnerId)?.name ??
            ''
          }
        />
      </View>
    ),
    [deliveries, partners],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<CrossDock>[] }) => {
      if (viewableItems.length === 0 || !crossDocks?.length) return;

      const lastItem = viewableItems[viewableItems.length - 1];
      const item = lastItem?.item;
      const index = lastItem?.index ?? -1;

      if (!item || index === -1) return;
      if (item.id === lastVisibleId) return;

      const isLastVisible = index === crossDocks.length - 1;
      if (isLastVisible && hasNextPage && !isLoading && !isWaiting) {
        setLastVisibleId(item.id);
        fetchNextPage();
      }
    },
    [
      crossDocks,
      hasNextPage,
      isLoading,
      isWaiting,
      lastVisibleId,
      fetchNextPage,
    ],
  );

  if (error) return <Text>error</Text>;

  return (
    <>
      <View className="container h-full p-2">
        <View className="flex-row gap-3">
          <Input
            className="mb-2 flex-1"
            placeholder={t('cross-dock-list.search-by-name')}
            value={searchValue}
            onChangeText={setSearchValue}
          />
          <View className="w-1/3 py-1">
            {isFocused && (
              <Scanner
                size="sm"
                label={t('scan')}
                mockData="0188985357279"
                onScan={async (data) => {
                  try {
                    const foundCrossDock = await findCrossDockBySku({
                      sku: data,
                    });
                    if (foundCrossDock) {
                      setFoundCrossDock(foundCrossDock);
                      setRedirectModalOpen(true);
                    } else {
                      notificationModalOpen();
                    }
                  } catch {
                    notificationModalOpen();
                  }
                }}
              />
            )}
          </View>
        </View>

        <Dropdown<number, Partner>
          value={state.selectedPartner}
          setValue={(value) =>
            dispatch({ type: PagesStateActions.SET_SELECTED_PARTNER, value })
          }
          data={partners}
          placeholder={t('partner')}
        />

        <Dropdown<number, Delivery>
          value={state.selectedDelivery}
          setValue={(value) =>
            dispatch({ type: PagesStateActions.SET_SELECTED_DELIVERY, value })
          }
          data={deliveries}
          placeholder={t('delivery')}
        />

        <FlatList
          data={crossDocks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
          ListFooterComponent={
            isLoading || isWaiting ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#666666" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading && !isWaiting && crossDocks?.length === 0 ? (
              <View className="items-center py-4">
                <Text>{t('cross-dock-list.no-results')}</Text>
              </View>
            ) : null
          }
        />
      </View>

      {notificationModal}

      <RedirectModal
        open={redirectModalOpen}
        title={t('cross-dock-list.redirect-to-cross-dock')}
        description={
          <>
            <View>
              <Text>{t('cross-dock-list.redirect-confirm')} </Text>
            </View>
            <View>
              <Text className="font-bold">{foundCrossDock?.name ?? '-'}</Text>
            </View>
          </>
        }
        hrefObject={{
          pathname: './cross-dock-detail',
          /* @ts-ignore */
          params: foundCrossDock,
        }}
        setClose={() => setRedirectModalOpen(false)}
      />
    </>
  );
}
