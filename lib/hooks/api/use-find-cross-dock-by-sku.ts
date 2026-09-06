import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import { CrossDock } from '~/lib/types';

type CrossDockBySku = {
  sku: string;
};

export default function useFindCrossDockBySku(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: CrossDockBySku) => Promise<CrossDock>;
} {
  const { session } = useSession();
  const mutateRecords = async ({ sku }: CrossDockBySku) => {
    const path = `${API_ROOT}/exit/find/cross-dock?sku=${sku}`;
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
    mutationKey: [`find-cross-dock-by-sku`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: CrossDockBySku) => mutateAsync(args),
  };
}
