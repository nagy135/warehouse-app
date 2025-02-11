import { useQuery } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import type { Storage } from '~/lib/types';

export default function useGetStoragesById(ids: number[]): {
  data: Storage[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    const params = new URLSearchParams();
    params.append('ids', ids.join(','));
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching here: ${API_ROOT}/storages?${params.toString()}`);
    }

    const res = await fetch(`${API_ROOT}/storages?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isRefetching } = useQuery({
    queryKey: [`get-storages-by-ids`],
    queryFn: fetchRecords,
  });
  return { data, error, isLoading, isRefetching };
}
