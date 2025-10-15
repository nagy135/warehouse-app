import { useQuery } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import type { Delivery } from '~/lib/types';

export default function useGetDeliveries(): {
  data: Delivery[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching here: ${API_ROOT}/deliveries`);
    }

    const res = await fetch(`${API_ROOT}/deliveries`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isRefetching } = useQuery({
    queryKey: [`get-deliveries`],
    queryFn: fetchRecords,
  });
  return { data, error, isLoading, isRefetching };
}
