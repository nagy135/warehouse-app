import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { useState } from 'react';
import { API_ROOT } from '~/lib/constants';

export default function useGetRecords<T>(params?: {
  search?: string;
  partner?: number;
  delivery?: number;
}): {
  data: T[] | undefined;
  isWaiting: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
} {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const fetchRecords = async ({ pageParam = 1 }) => {
    const searchString = params?.search
      ? new URLSearchParams({ search: params.search }).toString()
      : '';

    const partnerString = params?.partner
      ? new URLSearchParams({ partnerId: params.partner.toString() }).toString()
      : '';

    const deliveryString = params?.delivery
      ? new URLSearchParams({
          deliveryId: params.delivery.toString(),
        }).toString()
      : '';

    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG === 'true') {
      console.log(
        `fetching: ${API_ROOT}/exits?page=${pageParam}&pageSize=${pageSize}&${searchString}&${partnerString}&${deliveryString}`,
      );
    }

    const res = await fetch(
      `${API_ROOT}/exits?page=${pageParam}&pageSize=${pageSize}&${searchString}&${partnerString}&${deliveryString}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      data,
      nextPage: data.length === pageSize ? pageParam + 1 : undefined,
    };
  };

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['exits', params?.search, params?.partner, params?.delivery],
    queryFn: fetchRecords,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const flatData = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    data: flatData,
    isWaiting: isFetchingNextPage,
    isLoading,
    error: error as Error | null,
    refreshing,
    onRefresh: async () => {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: ['exits'],
      });
      setRefreshing(false);
    },
    fetchNextPage,
    hasNextPage,
  };
}
