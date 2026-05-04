import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import ProductInfoView from '~/components/info/ProductInfoView';
import StoragePositionInfoView from '~/components/info/StoragePositionInfoView';
import Scanner from '~/components/scanner';
import { Text } from '~/components/ui/text';
import useGetInfo, { type InfoResponse } from '~/lib/hooks/api/use-get-info';

const InfoScreen = () => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [error, setError] = useState('');
  const { isPending, mutateAsync: getInfo } = useGetInfo();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  function handleScan(code: string) {
    setError('');
    setInfo(null);
    getInfo({ code })
      .then((data) => {
        setInfo(data);
      })
      .catch(() => {
        setError(t('info.not-found'));
      });
  }

  return (
    <View className="flex-1 gap-4 bg-background p-4">
      {error && (
        <View className="rounded bg-red-100 p-2">
          <Text className="text-center font-bold text-red-600">{error}</Text>
        </View>
      )}

      <View>
        {isFocused && (
          <Scanner
            mockData="4260189213769"
            label={
              process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true'
                ? t('info.scan-code')
                : ''
            }
            onScan={handleScan}
          />
        )}
      </View>

      {isPending && (
        <View className="items-center py-4">
          <ActivityIndicator size={40} color="#666666" />
        </View>
      )}

      {info?.type === 'product' && <ProductInfoView info={info} />}
      {(info?.type === 'storage' || info?.type === 'position') && (
        <StoragePositionInfoView info={info} />
      )}
    </View>
  );
};

export default InfoScreen;
