import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

export type StoreInventoryItem = {
  positionId: string;
  storageId: string;
  productId: string;
  expirationDate?: string;
  batchNumber?: string;
  count: number;
};

type StoreInventoryParams = {
  items: StoreInventoryItem[];
};

export default function useStoreInventory(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: StoreInventoryParams) => Promise<void>;
} {
  const { session } = useSession();
  const mutateStore = async ({ items }: StoreInventoryParams) => {
    const path = `${API_ROOT}/inventory/store`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`storing inventory: ${path}`, items);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(items),
    });

    if (!res.ok) {
      throw new Error('Failed to store inventory');
    }
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`store-inventory`],
    mutationFn: mutateStore,
  });

  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: StoreInventoryParams) => mutateAsync(args),
  };
}

