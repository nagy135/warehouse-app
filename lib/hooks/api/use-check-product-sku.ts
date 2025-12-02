import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

type CheckProductSkuParams = {
  sku: string;
};

export type CheckProductSkuResponse = {
  id: string;
  name: string;
  sku: string;
  ean: string;
  hasExpirationDate: boolean;
  hasBatchNumber: boolean;
};

export default function useCheckProductSku(): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutateAsync: (args: CheckProductSkuParams) => Promise<CheckProductSkuResponse>;
} {
  const { session } = useSession();
  const mutateCheck = async ({ sku }: CheckProductSkuParams) => {
    const path = `${API_ROOT}/inventory/product/sku?sku=${sku}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`checking product sku: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Product not found');
    }

    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutateAsync } = useMutation({
    mutationKey: [`check-product-sku`],
    mutationFn: mutateCheck,
  });

  return {
    isPending,
    isError,
    isSuccess,
    mutateAsync: (args: CheckProductSkuParams) => mutateAsync(args),
  };
}

