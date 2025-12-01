import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type DeleteInventoryParams = {
  positionSku: string;
};

export default function useDeleteInventory(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: DeleteInventoryParams) => Promise<void>;
} {
  const { session } = useSession();
  const mutateDelete = async ({ positionSku }: DeleteInventoryParams) => {
    const path = `${API_ROOT}/inventory/delete?positionSku=${positionSku}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`deleting inventory: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete inventory');
    }
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`delete-inventory`],
    mutationFn: mutateDelete,
  });

  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: DeleteInventoryParams) => mutateAsync(args),
  };
}

