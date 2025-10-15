import { useQuery } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import type { Partner } from '~/lib/types';

export default function useGetPartners(): {
  data: Partner[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching here: ${API_ROOT}/partners`);
    }

    const res = await fetch(`${API_ROOT}/partners`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isRefetching } = useQuery({
    queryKey: [`get-partners`],
    queryFn: fetchRecords,
  });
  return { data, error, isLoading, isRefetching };
}
