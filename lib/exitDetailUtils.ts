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
    ean: string;
    isBox: boolean;
    expirations: { value: string; count: number }[];
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

  const orderMap = new Map<string, { id: number; date?: string }[]>();

  for (const row of data) {
    const product = {
      id: row.product?.id ?? -1,
      name: row.product?.name ?? '',
      sku: row.product?.sku ?? '',
      ean: row.product?.ean ?? '',
      isBox: !!row.product?.isBox,
      expirations: [] as { value: string; count: number }[],
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
      orderMap.set(key, []);
    }

    const item = map.get(key)!;
    item.count += 1;

    const dateOnly = row.expiration ? row.expiration.split('T')[0] : undefined;

    orderMap.get(key)!.push({ id: row.id, date: dateOnly });

    if (dateOnly) {
      const found = item.product.expirations.find((e) => e.value === dateOnly);
      if (found) {
        found.count += 1;
      } else {
        item.product.expirations.push({ value: dateOnly, count: 1 });
      }
    }
  }

  return Array.from(map.values()).map((i) => {
    const expirationsSorted = i.product.expirations
      .slice()
      .sort(
        (a, b) => new Date(a.value).getTime() - new Date(b.value).getTime(),
      );

    const idsSorted = orderMap
      .get(`${i.product.id}#${i.storage.id}#${i.position.id}`)!
      .slice()
      .sort((a, b) => {
        const ad = a.date
          ? new Date(a.date).getTime()
          : Number.POSITIVE_INFINITY;
        const bd = b.date
          ? new Date(b.date).getTime()
          : Number.POSITIVE_INFINITY;
        if (ad !== bd) return ad - bd;
        return a.id - b.id;
      })
      .map((x) => x.id);

    return {
      ...i,
      productStoragesId: idsSorted,
      product: {
        ...i.product,
        expirations: expirationsSorted,
      },
    };
  });
}
