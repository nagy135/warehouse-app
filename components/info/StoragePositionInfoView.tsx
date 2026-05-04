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
import { type StoragePositionInfoResponse } from '~/lib/hooks/api/use-get-info';

type Props = {
  info: StoragePositionInfoResponse;
};

const emptyValue = '-';

const displayExpiration = (expiration: string | null) => {
  if (!expiration) return emptyValue;
  const date = new Date(expiration);
  if (Number.isNaN(date.getTime())) return expiration;

  return date.toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const EntitySummary = ({
  label,
  name,
  sku,
}: {
  label: string;
  name?: string | null;
  sku?: string | null;
}) => (
  <View className="rounded-lg border border-border bg-card p-3">
    <Text className="text-xs text-muted-foreground">{label}</Text>
    <Text className="mt-0.5 text-lg font-bold">{name || emptyValue}</Text>
    <Text className="mt-0.5 text-xs text-muted-foreground">
      SKU: {sku || emptyValue}
    </Text>
  </View>
);

export default function StoragePositionInfoView({ info }: Props) {
  const { t } = useTranslation();
  const primaryEntity = info.type === 'storage' ? info.storage : info.position;
  const secondaryEntity =
    info.type === 'storage' ? info.position : info.storage;

  return (
    <View className="flex-1 gap-4">
      <EntitySummary
        label={t(`info.${info.type}`)}
        name={primaryEntity?.name}
        sku={primaryEntity?.sku}
      />
      <EntitySummary
        label={t(info.type === 'storage' ? 'info.position' : 'info.storage')}
        name={secondaryEntity?.name}
        sku={secondaryEntity?.sku}
      />

      <ScrollView className="flex-1 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5 px-2">
                <Text>{t('info.name')}</Text>
              </TableHead>
              <TableHead className="w-1/4 px-2">
                <Text>{t('info.expiration-date')}</Text>
              </TableHead>
              <TableHead className="w-1/5 px-2">
                <Text>{t('info.state')}</Text>
              </TableHead>
              <TableHead className="w-[15%] px-2">
                <Text>{t('count')}</Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {info.products.length === 0 ? (
              <TableRow>
                <TableCell className="w-full">
                  <Text className="text-center text-muted-foreground">
                    {t('info.no-products')}
                  </Text>
                </TableCell>
              </TableRow>
            ) : (
              info.products.map((product, index) => (
                <TableRow
                  key={`${product.name}-${product.expiration}-${product.state}-${index}`}
                >
                  <TableCell className="w-2/5 px-2">
                    <Text>{product.name || emptyValue}</Text>
                  </TableCell>
                  <TableCell className="w-1/4 px-2">
                    <Text>{displayExpiration(product.expiration)}</Text>
                  </TableCell>
                  <TableCell className="w-1/5 px-2">
                    <Text>
                      {t(`info.states.${product.state}`, product.state)}
                    </Text>
                  </TableCell>
                  <TableCell className="w-[15%] px-2">
                    <Text>{product.count}</Text>
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
