import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type MoveCrossDockToWarehouse = {
  sku: string;
  crossDockId: number;
};

type MoveCrossDockToWarehouseResponse = {
  id: number;
  state: string;
  productStorageId: number;
};

export default function useMoveCrossDockToWarehouse(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (
    args: MoveCrossDockToWarehouse,
  ) => Promise<MoveCrossDockToWarehouseResponse>;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    sku,
    crossDockId,
  }: MoveCrossDockToWarehouse) => {
    const path = `${API_ROOT}/cross-dock/move-to-warehouse`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      body: JSON.stringify({ sku, crossDockId }),
      method: 'POST',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'unknown');
    }

    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`move-cross-dock-to-warehouse`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: MoveCrossDockToWarehouse) => mutateAsync(args),
  };
}
