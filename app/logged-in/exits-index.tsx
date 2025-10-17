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
import ExitCard from '~/components/exit/card';
import RedirectModal from '~/components/modal/redirect-modal';
import Scanner from '~/components/scanner';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import useFindExitBySku from '~/lib/hooks/api/use-find-exit-by-sku';
import useGetRecords from '~/lib/hooks/api/use-get-records';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { Exit, Partner, Delivery } from '~/lib/types';
import useGetPartners from '~/lib/hooks/api/use-get-partners';
import useGetDeliveries from '~/lib/hooks/api/use-get-deliveries';
import { Dropdown } from '~/components/ui/dropdown';
import { usePageStateContext, PagesStateActions } from '../contexts/PageStateContext';

export default function ExitsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { state, dispatch } = usePageStateContext();
  const [foundExit, setFoundExit] = useState<Exit | null>(null);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lastVisibleId, setLastVisibleId] = useState<number | null>(null);

  const { t } = useTranslation();
  const { mutateAsync: findExitBySku } = useFindExitBySku();
  const { setOpen: notificationModalOpen, modal: notificationModal } =
    useNotificationModal({
      title: t('not-found-title'),
      description: t('exit-list.not-found'),
    });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const {
    data: exits,
    isWaiting,
    isLoading,
    error,
    refreshing,
    onRefresh,
    fetchNextPage,
    hasNextPage,
  } = useGetRecords<Exit>({
    search: debouncedSearch,
    partner: state.selectedPartner ?? undefined,
    delivery: state.selectedDelivery ?? undefined
  });

  const { data: partners } = useGetPartners();
  const { data: deliveries } = useGetDeliveries();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const renderItem = useCallback(
    ({ item }: { item: Exit }) => (
      <View className="my-1">
        <ExitCard
          exit={item}
          delivery={
            deliveries?.find((delivery) => delivery.id === item.deliveryId)?.name ?? ''
          }
          partner={
            partners?.find((partner) => partner.id === item.partnerId)?.name ?? ''
          }
        />
      </View>
    ),
    [deliveries, partners]
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Exit>[] }) => {
      if (viewableItems.length === 0 || !exits?.length) return;

      const lastItem = viewableItems[viewableItems.length - 1];
      const item = lastItem?.item;
      const index = lastItem?.index ?? -1;

      if (!item || index === -1) return;
      if (item.id === lastVisibleId) return;

      const isLastVisible = index === exits.length - 1;
      if (isLastVisible && hasNextPage && !isLoading && !isWaiting) {
        setLastVisibleId(item.id);
        fetchNextPage();
      }
    },
    [exits, hasNextPage, isLoading, isWaiting, lastVisibleId, fetchNextPage]
  );

  if (error) return <Text>error</Text>;

  return (
    <>
      <View className="container h-full p-2">
        <View className="flex-row gap-3">
          <Input
            className="mb-2 flex-1"
            placeholder={t('exit-list.search-by-name')}
            value={searchValue}
            onChangeText={setSearchValue}
          />
          <View className="w-1/3 py-1">
            {isFocused && (
              <Scanner
                size="sm"
                label={t('scan')}
                mockData="billadeliveryofpancakes123"
                onScan={async (data) => {
                  try {
                    const foundExit = await findExitBySku({ sku: data });
                    if (foundExit) {
                      setFoundExit(foundExit);
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
          data={exits}
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
            (isLoading || isWaiting) ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="large" color="#666666" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            (!isLoading && !isWaiting && exits?.length === 0) ? (
              <View className="py-4 items-center">
                <Text>{t('exit-list.no-results')}</Text>
              </View>
            ) : null
          }
        />
      </View>

      {notificationModal}

      <RedirectModal
        open={redirectModalOpen}
        title={t('exit-list.redirect-to-exit')}
        description={
          <>
            <View>
              <Text>{t('exit-list.redirect-confirm')} </Text>
            </View>
            <View>
              <Text className="font-bold">{foundExit?.name ?? '-'}</Text>
            </View>
          </>
        }
        hrefObject={{
          pathname: './exit-detail',
          /* @ts-ignore */
          params: foundExit,
        }}
        setClose={() => setRedirectModalOpen(false)}
      />
    </>
  );
}
