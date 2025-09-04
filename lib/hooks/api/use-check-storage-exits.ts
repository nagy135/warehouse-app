import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type checkStorageExits = {
  sku: string;
  includeItems?: boolean;
};

export type checkStorageExitsResponse = {
  id: number;
  sku: string;
  name: string;
  productStorages?: Array<{
    id: number;
  }>;
};

export default function useCheckStorageExits(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: checkStorageExits) => Promise<checkStorageExitsResponse>;
} {
  const { session } = useSession();
  const mutateRecords = async ({ sku, includeItems }: checkStorageExits) => {
    const path = `${API_ROOT}/storage/sku?sku=${sku}&includeItems=${includeItems}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'GET',
    });
    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`check-storage-exits`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: checkStorageExits) => mutateAsync(args),
  };
}
