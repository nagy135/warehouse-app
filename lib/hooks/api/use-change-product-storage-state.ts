import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

export default function useChangeProductStorageState({
  onSuccessCallback,
}: {
  onSuccessCallback: () => void;
}): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (args: {
    ids: number[];
    change: 'counted' | 'moved' | 'none';
    storageSku?: string;
  }) => void;
  mutateAsync: (args: {
    ids: number[];
    change: 'counted' | 'moved' | 'none';
    storageSku?: string;
  }) => Promise<void>;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    ids,
    change,
    storageSku,
  }: {
    ids: number[];
    change: 'counted' | 'moved' | 'none';
    storageSku?: string;
  }) => {
    const path = `${API_ROOT}/product-storages/${change}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      body: JSON.stringify({ ids, storageSku }),
      method: 'POST',
    });
    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutate, mutateAsync } = useMutation({
    mutationKey: [`reset-product-storages`],
    mutationFn: mutateRecords,
    onSuccess: onSuccessCallback,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutate: (args: { ids: number[]; change: 'counted' | 'moved' | 'none' }) =>
      mutate(args),
    mutateAsync: (args: {
      ids: number[];
      change: 'counted' | 'moved' | 'none';
    }) => mutateAsync(args),
  };
}
