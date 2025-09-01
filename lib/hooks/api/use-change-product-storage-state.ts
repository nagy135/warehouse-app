import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type MoveProductStorage = {
  ids: number[];
  storageId: number;
  exitId: number;
  partnerId: number;
  productId: number;
};

export default function useMoveProductStorage(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: MoveProductStorage) => Promise<void>;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    ids,
    storageId,
    exitId,
    partnerId,
    productId,
  }: MoveProductStorage) => {
    const path = `${API_ROOT}/product-storages/moved`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      body: JSON.stringify({ ids, storageId, exitId, partnerId, productId }),
      method: 'POST',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data.error ?? 'unknown'));
    }

    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`reset-product-storages`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: MoveProductStorage) => mutateAsync(args),
  };
}
