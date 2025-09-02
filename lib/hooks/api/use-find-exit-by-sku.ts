import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import { Exit } from '~/lib/types';

type exitByTrackingNumber = {
  sku: string;
};

export default function useFindExitBySku(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: exitByTrackingNumber) => Promise<Exit>;
} {
  const { session } = useSession();
  const mutateRecords = async ({ sku }: exitByTrackingNumber) => {
    const path = `${API_ROOT}/exit/find?sku=${sku}`;
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
    mutationKey: [`find-exit-by-tracking-number`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: exitByTrackingNumber) => mutateAsync(args),
  };
}
