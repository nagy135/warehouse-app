import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

export default function useTransferStorageItems({
  onSuccessCallback,
  onErrorCallback,
}: {
  onSuccessCallback: () => void;
  onErrorCallback: () => void;
}): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: string;
  mutate: (args: {
    originalStorageId: number;
    newStorageId: number;
    productStorageIds?: number[];
  }) => void;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    originalStorageId,
    newStorageId,
    productStorageIds,
  }: {
    originalStorageId: number;
    newStorageId: number;
    productStorageIds?: number[];
  }) => {
    const path = `${API_ROOT}/product-storages/storage-transfer`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      body: JSON.stringify({
        originalStorageId,
        newStorageId,
        productStorageIds,
      }),
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data.error ?? 'unknown'));
    }

    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`returned: ${JSON.stringify(data)}`);
    }
    return data;
  };

  const { isPending, isError, isSuccess, mutate, error } = useMutation({
    mutationFn: mutateRecords,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });
  return {
    isPending,
    isError,
    isSuccess,
    error: error?.message ?? '',
    mutate: (args) => mutate(args),
  };
}
