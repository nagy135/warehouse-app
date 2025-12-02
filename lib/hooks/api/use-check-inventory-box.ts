import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type CheckInventoryBoxParams = {
  positionSku: string;
  boxSku: string;
};

export type InventoryProduct = {
  id: string;
  name: string;
  expirationDate?: string;
  batchNumber?: string;
  count: number;
};

export type CheckInventoryBoxResponse = {
  hasCorrectPosition: boolean;
  correctPositionName?: string;
  storageId: string;
  products: InventoryProduct[];
};

export default function useCheckInventoryBox(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: CheckInventoryBoxParams) => Promise<CheckInventoryBoxResponse>;
} {
  const { session } = useSession();
  const mutateCheck = async ({ positionSku, boxSku }: CheckInventoryBoxParams) => {
    const path = `${API_ROOT}/inventory/check-box?positionSku=${positionSku}&boxSku=${boxSku}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`checking inventory box: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Box not found');
    }

    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`check-inventory-box`],
    mutationFn: mutateCheck,
  });

  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: CheckInventoryBoxParams) => mutateAsync(args),
  };
}

