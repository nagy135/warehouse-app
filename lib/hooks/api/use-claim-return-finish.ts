import { useMutation } from '@tanstack/react-query';
import { ScannedProductStorages } from '~/components/claim/scan-products';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type FinishClaimReturn = {
  type: 'claim' | 'return';
  exitId: number;
  products: ScannedProductStorages[];
};

export default function useFinishClaimReturn(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: FinishClaimReturn) => Promise<void>;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    type,
    exitId,
    products: skuVariants,
  }: FinishClaimReturn) => {
    const path = `${API_ROOT}/${type}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`changing: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      body: JSON.stringify({
        exitId,
        skuVariants,
      }),
      method: 'POST',
    });
    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`finish-claim-return`],
    mutationFn: mutateRecords,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: FinishClaimReturn) => mutateAsync(args),
  };
}
