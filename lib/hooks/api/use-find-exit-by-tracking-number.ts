import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';
import { ExitWithPackages } from '~/lib/types';

type exitByTrackingNumber = {
  trackingNumber: string;
};

export type exitByTrackingNumberResponse = {
  id: string;
  trackingNumber: string;
  exit: ExitWithPackages;
  exitId: string;
};

export default function useFindExitByTrackingNumber(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (
    args: exitByTrackingNumber,
  ) => Promise<exitByTrackingNumberResponse>;
} {
  const { session } = useSession();
  const mutateRecords = async ({ trackingNumber }: exitByTrackingNumber) => {
    const path = `${API_ROOT}/package/tracking-number?trackingNumber=${trackingNumber}`;
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
