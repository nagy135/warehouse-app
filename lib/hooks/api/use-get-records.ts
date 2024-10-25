import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { useEffect, useRef, useState } from "react";
import { API_ROOT } from "~/lib/constants";

export default function useGetRecords<T>(
  apiKey: string,
  search?: string
): {
  data: T[] | undefined;
  isWaiting: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
} {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [isWaiting, setIsWaiting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRef = useRef<NodeJS.Timeout | null>(null);

  const searchString = search
    ? new URLSearchParams({
        search,
      }).toString()
    : "";

  useEffect(() => {
    if (handleRef.current) clearTimeout(handleRef.current);

    handleRef.current = setTimeout(() => {
      setIsWaiting(true);
      queryClient.invalidateQueries({ queryKey: [apiKey] });
    }, 300);
  }, [search]);

  const fetchRecords = async () => {
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == "true") {
      console.log(`fetching: ${API_ROOT}/${apiKey}?${searchString}`);
	}

    const res = await fetch(`${API_ROOT}/${apiKey}?pageSize=50&${searchString}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    setIsWaiting(false);
    return data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: [apiKey],
    queryFn: fetchRecords,
  });

  return {
    data,
    isWaiting,
    error,
    isLoading,
    refreshing,
    onRefresh: () => {
      setRefreshing(true);
      queryClient.invalidateQueries({ queryKey: [apiKey] });
      setRefreshing(false);
    },
  };
}
