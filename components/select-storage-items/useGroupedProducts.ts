import { useMemo } from 'react';
import { checkStorageExitsResponse } from '~/lib/hooks/api/use-check-storage-exits';

type GroupedProduct = {
  productStorageIds: number[];
  id: number;
  key: string;
  name: string;
  batchNumber?: string;
  expirationDate?: string;
  count: number;
};

export type GroupedProducts = Record<string, GroupedProduct>;

export const useGroupedProducts = (
  productStoragesInBox: NonNullable<
    checkStorageExitsResponse['productStorages']
  >,
) =>
  useMemo(
    () =>
      productStoragesInBox.reduce<GroupedProducts>((acc, ps) => {
        const expirationDate = ps.expiration
          ? ps.expiration.split('T')[0]
          : undefined;
        const key = `${ps.product.id}-${ps.batchNumber ?? ''}-${expirationDate ?? ''}`;

        if (!acc[key]) {
          acc[key] = {
            id: ps.product.id,
            key,
            name: ps.product.name ?? '',
            batchNumber: ps.batchNumber,
            expirationDate,
            productStorageIds: [],
            count: 0,
          };
        }

        acc[key].productStorageIds.push(ps.id);
        acc[key].count += 1;

        return acc;
      }, {}),
    [productStoragesInBox],
  );
