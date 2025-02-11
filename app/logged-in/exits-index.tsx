import { useIsFocused } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import ExitCard from '~/components/exit/card';
import RedirectModal from '~/components/modal/redirect-modal';
import Scanner from '~/components/scanner';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import useGetRecords from '~/lib/hooks/api/use-get-records';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { Exit } from '~/lib/types';

export default function ExitsPage() {
  const isFocused = useIsFocused();
  const [searchValue, setSearchValue] = useState('');
  const [foundExit, setFoundExit] = useState<Exit | null>(null);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const { t } = useTranslation();
  const { setOpen: notificationModalOpen, modal: notificationModal } =
    useNotificationModal({
      title: t('not-found-title'),
      description: t('exit-list.not-found'),
    });

  const {
    data: exits,
    isWaiting,
    isLoading,
    error,
    refreshing,
    onRefresh,
  } = useGetRecords<Exit>('exits', searchValue);

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
                size={'sm'}
                label={t('scan')}
                mockData="billadeliveryofpancakes123"
                onScan={(data) => {
                  const foundExit = exits?.find(
                    (exit: Exit) => exit.sku === data,
                  );
                  if (foundExit) {
                    setFoundExit(foundExit);
                    setRedirectModalOpen(true);
                  } else {
                    notificationModalOpen();
                  }
                }}
              />
            )}
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {exits?.map((exit: Exit, i: number) => (
            <View key={`exit-card-${i}`} className="my-1">
              <ExitCard exit={exit} />
            </View>
          ))}
        </ScrollView>
      </View>
      {(isWaiting || isLoading) && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
          <ActivityIndicator size={60} color="#666666" />
        </View>
      )}
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
