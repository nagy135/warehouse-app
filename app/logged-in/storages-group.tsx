import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import useGetStoragesById from '~/lib/hooks/api/use-get-storages-by-id';
import { usePageStateContext } from '../contexts/PageStateContext';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';

export default function ProductStorageGroup() {
  const { storageIds, exitName } = useLocalSearchParams<{
    storageIds: string;
    exitName: string;
  }>();
  const storageIdsNumber = storageIds.split(',').map((id) => Number(id));
  const { data, isLoading, isRefetching } =
    useGetStoragesById(storageIdsNumber);
  const {
    state: { productStorages },
  } = usePageStateContext();
  const { t } = useTranslation();

  if (isLoading || isRefetching)
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );

  return (
    <ScrollView className="m-3 flex">
      <Text className="mb-2 text-center text-2xl font-bold">
        {productStorages?.[0].productSkuVariant.name}
      </Text>
      <Text className="mb-2">
        {t('exit')}: {exitName}
      </Text>
      {data?.map((storage, i) => {
        const storageItems = productStorages.filter(
          (item) => item.storage.id === storage.id,
        );
        return (
          <Card
            key={`storage-card-${i}`}
            className={cn(
              'my-1 w-full',
              storageItems.every((item) => item.state === 'moved') &&
                'bg-green-100',
            )}
          >
            <TouchableOpacity>
              <CardHeader>
                <CardTitle>{storage.name}</CardTitle>
                <CardDescription>{`${storage.type} #${storage.id}`}</CardDescription>
              </CardHeader>
              <CardContent>
                <Text className="text-lg font-bold">
                  {t('storages.count')}:{' '}
                </Text>
                <Text>
                  {t('storages.overall')}: {storageItems.length}
                </Text>
                <Text>
                  {t('storages.moved')}:{' '}
                  {storageItems.filter((item) => item.state === 'moved').length}
                </Text>
              </CardContent>

              {storage.position && (
                <CardContent>
                  <Text className="text-lg font-bold">
                    {t('storages.position')}:{' '}
                  </Text>
                  <Text>{storage.position?.name}</Text>
                </CardContent>
              )}
            </TouchableOpacity>
          </Card>
        );
      })}
    </ScrollView>
  );
}
