import { useQuery } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

export default function useRecordDetail<T>(
  id: number,
  path: string,
): {
  data: T | undefined;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching: ${API_ROOT}/${path}?id=${id}`);
    }

    const res = await fetch(`${API_ROOT}/${path}?id=${id}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [`get-${path}-detail`, id],
    queryFn: fetchRecords,
  });
  return { data, error, isLoading, isRefetching, refetch };
}
