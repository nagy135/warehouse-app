import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { type ProductInfoResponse } from '~/lib/hooks/api/use-get-info';

type Props = {
  info: ProductInfoResponse;
};

const emptyValue = '-';

export default function ProductInfoView({ info }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-4">
      <View className="rounded-lg border border-border bg-card p-4">
        <Text className="text-sm text-muted-foreground">
          {t('info.product')}
        </Text>
        <Text className="mt-1 text-xl font-bold">
          {info.product?.name || emptyValue}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          SKU: {info.product?.sku || emptyValue}
        </Text>
      </View>

      <ScrollView className="flex-1 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] px-2">
                <Text>{t('info.name')}</Text>
              </TableHead>
              <TableHead className="w-[30%] px-2">
                <Text>{t('info.position')}</Text>
              </TableHead>
              <TableHead className="w-2/5 px-2">
                <Text>{t('info.expiration-date')}</Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {info.storages.length === 0 ? (
              <TableRow>
                <TableCell className="w-full">
                  <Text className="text-center text-muted-foreground">
                    {t('info.no-locations')}
                  </Text>
                </TableCell>
              </TableRow>
            ) : (
              info.storages.map((storage) => (
                <TableRow key={storage.id}>
                  <TableCell className="w-[30%] px-2">
                    <Text>{storage.name || emptyValue}</Text>
                  </TableCell>
                  <TableCell className="w-[30%] px-2">
                    <Text>{storage.position?.name || emptyValue}</Text>
                  </TableCell>
                  <TableCell className="w-2/5 px-2">
                    {storage.items.length === 0 ? (
                      <Text>{emptyValue}</Text>
                    ) : (
                      storage.items.map((item, index) => (
                        <Text key={`${item.expiration}-${index}`}>
                          {item.expiration || emptyValue} ({item.count}{' '}
                          {t('piece')})
                        </Text>
                      ))
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollView>
    </View>
  );
}
