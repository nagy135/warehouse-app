import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import StatsTile from '~/components/exit-work-flow/stats-tile';
import NotificationModal from '~/components/modal/notification-modal';
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
import useMoveCrossDockToWarehouse from '~/lib/hooks/api/use-move-cross-dock-to-warehouse';
import useRecordDetail from '~/lib/hooks/api/use-record-detail';
import { Check, X } from '~/lib/icons';
import {
  CrossDock,
  CrossDockDetail,
  CrossDockProductStorage,
  EntryExitStatesEnum,
  type ToStringOrStringArray,
} from '~/lib/types';

const inProgressStates = [
  EntryExitStatesEnum.CREATED,
  EntryExitStatesEnum.REGISTERED,
  EntryExitStatesEnum.PARTIALLY_MOVED,
];

const emptyValue = '-';

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2).replace(/\.?0+$/, '');
}

function formatWeight(weight: number | null, weightUnitLabel: string): string {
  if (weight === null) {
    return emptyValue;
  }

  return `${formatNumber(weight / 1000)} ${weightUnitLabel}`;
}

function formatProductStorageSku(
  sku: string | null,
  crossDockId: number,
): string {
  if (!sku) {
    return emptyValue;
  }

  const prefix = `${crossDockId}_`;
  if (sku.startsWith(prefix)) {
    return sku.slice(prefix.length);
  }

  return sku;
}

function parseTransportUnitSku(sku: string): {
  crossDockId: number;
  transportUnitId: string;
} | null {
  const separatorIndex = sku.indexOf('_');
  if (separatorIndex <= 0) {
    return null;
  }

  const transportUnitId = sku.slice(separatorIndex + 1);
  if (!transportUnitId) {
    return null;
  }

  const crossDockId = Number(sku.slice(0, separatorIndex));
  if (!Number.isInteger(crossDockId) || crossDockId <= 0) {
    return null;
  }

  return { crossDockId, transportUnitId };
}

function CrossDockProductStorageRow({
  productStorage,
  crossDockId,
  weightUnitLabel,
}: {
  productStorage: CrossDockProductStorage;
  crossDockId: number;
  weightUnitLabel: string;
}) {
  const isMoved = productStorage.state === 'moved';

  return (
    <TableRow>
      <TableCell className="w-[35%] px-2">
        <Text>{productStorage.product.name ?? emptyValue}</Text>
      </TableCell>
      <TableCell className="w-[30%] px-2">
        <Text>{formatProductStorageSku(productStorage.sku, crossDockId)}</Text>
      </TableCell>
      <TableCell className="w-[20%] px-2">
        <Text>
          {formatWeight(productStorage.dimensions.weight, weightUnitLabel)}
        </Text>
      </TableCell>
      <TableCell className="w-[15%] px-2">
        <View className="items-center">
          {isMoved ? (
            <Check color="#16a34a" size={22} strokeWidth={2.5} />
          ) : (
            <X color="#dc2626" size={22} strokeWidth={2.5} />
          )}
        </View>
      </TableCell>
    </TableRow>
  );
}

export default function CrossDockDetailPage() {
  const crossDockParams =
    useLocalSearchParams<ToStringOrStringArray<CrossDock>>();
  const crossDockId = Number(crossDockParams.id);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isFocused, setIsFocused] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showError = useCallback((title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorMessage(message);
    setErrorModalOpen(true);
  }, []);

  const { data, isLoading, isRefetching, refetch } =
    useRecordDetail<CrossDockDetail>(crossDockId, 'cross-dock');

  const { mutateAsync: moveCrossDockToWarehouse } =
    useMoveCrossDockToWarehouse();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const productStorages = useMemo(
    () => data?.productStorages ?? [],
    [data?.productStorages],
  );

  const movedProductStorages = useMemo(
    () =>
      productStorages.filter(
        (productStorage) => productStorage.state === 'moved',
      ),
    [productStorages],
  );

  const handleScan = useCallback(
    async (sku: string) => {
      const trimmedSku = sku.trim();
      const parsedSku = parseTransportUnitSku(trimmedSku);

      if (!parsedSku) {
        showError(
          t('cross-dock-detail.scan-error'),
          t('cross-dock-detail.invalid-transport-unit-sku'),
        );
        return;
      }

      if (parsedSku.crossDockId !== crossDockId) {
        showError(
          t('cross-dock-detail.scan-error'),
          t('cross-dock-detail.wrong-cross-dock-transport-unit'),
        );
        return;
      }

      setIsMoving(true);
      try {
        const moveResult = await moveCrossDockToWarehouse({ sku: trimmedSku });

        if (moveResult.state === EntryExitStatesEnum.MOVED) {
          setIsDone(true);
          queryClient.invalidateQueries({ queryKey: ['cross-dock'] });
          setTimeout(() => {
            router.replace('/logged-in/cross-dock-index');
          }, 800);
          return;
        }

        await refetch();
      } catch (error) {
        showError(
          t('cross-dock-detail.move-error'),
          error instanceof Error
            ? error.message
            : t('cross-dock-detail.move-error'),
        );
      } finally {
        setIsMoving(false);
      }
    },
    [crossDockId, moveCrossDockToWarehouse, queryClient, refetch, showError, t],
  );

  if (isLoading) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  }

  if (data?.state && !inProgressStates.includes(data.state)) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <Text className="text-lg font-bold">{data.name}</Text>
        <Text>
          {t('cross-dock-detail.cross-dock-already-completed-description')}
        </Text>
        <Button
          size="lg"
          variant="outline"
          className="mt-4"
          onPress={() => router.back()}
        >
          <Text>{t('back')}</Text>
        </Button>
      </View>
    );
  }

  if (data?.isIncomplete) {
    return (
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        <Text className="text-lg font-bold">{data.name}</Text>
        <Text>{t('cross-dock-detail.cross-dock-incomplete-description')}</Text>
        <Button
          size="lg"
          variant="outline"
          className="mt-4"
          onPress={() => router.back()}
        >
          <Text>{t('back')}</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={isLandscape ? 'mb-3 flex-row items-center gap-4' : 'mb-3'}
        >
          <Text className="text-xl font-bold">{data?.name}</Text>
          <Text className="text-sm text-neutral-500">{`Cross-dock id: ${data?.id}`}</Text>
        </View>

        <View className={isLandscape ? 'flex-row gap-4' : ''}>
          <View
            className={
              isLandscape ? 'w-1/5 flex-col gap-y-3' : 'flex-row gap-3'
            }
          >
            <StatsTile
              label={t('cross-dock-detail.moved-items')}
              value={`${movedProductStorages.length}/${productStorages.length}`}
              emoji="📦"
              isLandscape={isLandscape}
            />
            <StatsTile
              label={t('cross-dock-detail.transport-units')}
              value={productStorages.length}
              emoji="🧾"
              isLandscape={isLandscape}
            />
          </View>

          <View className={isLandscape ? 'ml-4 flex-1' : ''}>
            <View
              className={`bg-neutral-200 dark:bg-neutral-800 ${isLandscape ? 'mx-4 w-[1px]' : 'my-4 h-[1px]'}`}
            />

            {isDone && (
              <View className="mb-4 rounded bg-green-100 p-2">
                <Text className="text-center font-bold text-green-600">
                  {t('cross-dock-detail.cross-dock-successful')}
                </Text>
              </View>
            )}

            {isFocused && !isDone && (
              <View className="mb-4 items-center">
                {isMoving || isRefetching ? (
                  <ActivityIndicator size="large" color="#666666" />
                ) : (
                  <Scanner
                    size="lg"
                    label={t('cross-dock-detail.scan-transport-unit')}
                    mockData="19504_7420924661300"
                    onScan={(data) => handleScan(data)}
                  />
                )}
              </View>
            )}

            <ScrollView className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%] px-2">
                      <Text>{t('cross-dock-detail.product-name')}</Text>
                    </TableHead>
                    <TableHead className="w-[30%] px-2">
                      <Text>{t('cross-dock-detail.sku')}</Text>
                    </TableHead>
                    <TableHead className="w-[20%] px-2">
                      <Text>{t('cross-dock-detail.weight')}</Text>
                    </TableHead>
                    <TableHead className="w-[15%] px-2">
                      <Text>{t('cross-dock-detail.state')}</Text>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productStorages.length === 0 ? (
                    <TableRow>
                      <TableCell className="w-full">
                        <Text className="text-center text-muted-foreground">
                          {t('cross-dock-detail.no-transport-units')}
                        </Text>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productStorages.map((productStorage) => (
                      <CrossDockProductStorageRow
                        key={productStorage.id}
                        productStorage={productStorage}
                        crossDockId={crossDockId}
                        weightUnitLabel={t('cross-dock-detail.weight-unit')}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <NotificationModal
        open={errorModalOpen}
        title={errorModalTitle}
        description={errorMessage}
        variant="danger"
        setClose={() => setErrorModalOpen(false)}
      />
    </>
  );
}
