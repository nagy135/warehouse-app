import { ProductStorage, StoredProduct } from './types';

type summarizeProductCountsOutput = { id: number; count: number }[];

export function summarizeProductCounts(
  productStorages: ProductStorage[],
): summarizeProductCountsOutput {
  const map = new Map<number, number>();

  for (const ps of productStorages) {
    const pId = ps.product?.id;
    if (!map.has(pId)) {
      map.set(pId, 0);
    }
    map.set(pId, map.get(pId)! + 1);
  }

  return Array.from(map.entries()).map(([id, count]) => ({ id, count }));
}

export type ProductPosition = {
  product: {
    id: number;
    name: string;
    sku: string;
  };
  storage: {
    id: number;
    name: string;
    sku: string;
  };
  position: {
    id: number;
    name: string;
    sku: string;
  };
  count: number;
  productStoragesId: number[];
};

export type ProductPositionList = ProductPosition[];

export function buildProductPositionList(
  data: StoredProduct[],
): ProductPositionList {
  const map = new Map<string, ProductPosition>();

  for (const row of data) {
    const product = {
      id: row.product?.id ?? -1,
      name: row.product?.name ?? '',
      sku: row.product?.sku ?? '',
    };

    const storage = {
      id: row.storage?.id ?? -1,
      name: row.storage?.name ?? '',
      sku: row.storage?.sku ?? '',
    };

    const position = {
      id: row.storage?.position?.id ?? -1,
      name: row.storage?.position?.name ?? '',
      sku: row.storage?.position?.sku ?? '',
    };

    if (product.id === -1 || storage.id === -1 || position.id === -1) continue;

    const key = `${product.id}#${storage.id}#${position.id}`;
    if (!map.has(key)) {
      map.set(key, {
        product,
        storage,
        position,
        count: 0,
        productStoragesId: [],
      });
    }

    const item = map.get(key)!;
    item.count += 1;
    item.productStoragesId.push(row.id);
  }

  return Array.from(map.values()).map((i) => ({
    ...i,
    productStoragesId: i.productStoragesId.sort((a, b) => a - b),
  }));
}
