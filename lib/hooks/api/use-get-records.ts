import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { useEffect, useRef, useState } from 'react';
import { API_ROOT } from '~/lib/constants';

export default function useGetRecords<T>(params?: {
  search?: string;
  page?: number;
}): {
  data: T[] | undefined;
  isWaiting: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
} {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [isWaiting, setIsWaiting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [accumulatedData, setAccumulatedData] = useState<T[]>([]);
  const previousSearchRef = useRef(params?.search);

  const searchString = params?.search
    ? new URLSearchParams({
        search: params.search,
      }).toString()
    : '';
  const pageString = params?.page
    ? new URLSearchParams({
        page: params.page.toString(),
      }).toString()
    : '';

  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`fetching: ${API_ROOT}/exits?${searchString}&${pageString}`);
    }

    const res = await fetch(
      `${API_ROOT}/exits?pageSize=10&${searchString}&${pageString}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    const data = await res.json();
    setIsWaiting(false);
    return data;
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [params],
    queryFn: fetchRecords,
  });

  // Reset accumulated data when search changes
  useEffect(() => {
    if (previousSearchRef.current !== params?.search) {
      setAccumulatedData([]);
      previousSearchRef.current = params?.search;
    }
  }, [params?.search]);

  // Accumulate data when new data arrives
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAccumulatedData((prev) => {
        // If it's page 1 or search changed, replace the data
        if (params?.page === 1 || params?.page === undefined) {
          return data;
        }
        // Otherwise, append new data
        return [...prev, ...data];
      });
    }
  }, [data, params?.page]);

  return {
    data: accumulatedData,
    isWaiting,
    error,
    isLoading,
    isFetching,
    refreshing,
    onRefresh: () => {
      setRefreshing(true);
      setAccumulatedData([]);
      queryClient.invalidateQueries({ queryKey: [params] });
      setRefreshing(false);
    },
  };
}
