import { useQuery } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import type { StoredProduct } from '~/lib/types';

type storedByProductIds = {
  products: {
    id: number;
    count: number;
  }[];
  productExpirationDateMap?: Record<string, string>;
};

export default function useGetStoredProductsQuery(
  { products, productExpirationDateMap }: storedByProductIds,
  { enabled }: { enabled?: boolean },
): {
  data: StoredProduct[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching here: ${API_ROOT}/product-storages/stored`);
    }

    const path = `${API_ROOT}/product-storages/stored`;
    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        products,
        productExpirationDateMap,
      }),
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isRefetching } = useQuery({
    queryKey: [`get-storages-by-ids`, products],
    queryFn: fetchRecords,
    enabled,
  });
  return { data, error, isLoading, isRefetching };
}
