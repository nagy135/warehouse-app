import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type CheckInventoryPositionParams = {
  sku: string;
};

export type CheckInventoryPositionResponse = {
  isPartOfInventory: boolean;
  positionId: string;
  box?: {
    id: string;
    name: string;
  };
};

export default function useCheckInventoryPosition(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: CheckInventoryPositionParams) => Promise<CheckInventoryPositionResponse>;
} {
  const { session } = useSession();
  const mutateCheck = async ({ sku }: CheckInventoryPositionParams) => {
    const path = `${API_ROOT}/inventory/check-position?sku=${sku}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`checking inventory position: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'GET',
    });
    
    if (!res.ok) {
      throw new Error('Position not found');
    }
    
    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`check-inventory-position`],
    mutationFn: mutateCheck,
  });
  
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: CheckInventoryPositionParams) => mutateAsync(args),
  };
}

