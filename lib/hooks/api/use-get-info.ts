import { useMutation } from '@tanstack/react-query';
import { useSession } from '~/ctx';
import { API_ROOT } from '~/lib/constants';

export type InfoEntity = {
  id: number;
  name: string | null;
  sku: string | null;
};

export type StoragePositionInfoResponse = {
  type: 'storage' | 'position';
  storage: InfoEntity | null;
  position: InfoEntity | null;
  products: {
    name: string | null;
    expiration: string | null;
    state: string;
    count: number;
  }[];
};

export type ProductInfoResponse = {
  type: 'product';
  product: InfoEntity | null;
  storages: (InfoEntity & {
    position: InfoEntity | null;
    items: {
      expiration: string;
      count: number;
    }[];
  })[];
};

export type InfoResponse = StoragePositionInfoResponse | ProductInfoResponse;

type GetInfoParams = {
  code: string;
};

export default function useGetInfo(): {
  isPending: boolean;
  mutateAsync: (args: GetInfoParams) => Promise<InfoResponse>;
} {
  const { session } = useSession();

  const getInfo = async ({ code }: GetInfoParams) => {
    const path = `${API_ROOT}/info?code=${encodeURIComponent(code)}`;
    if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
      console.log(`getting info: ${path}`);
    }

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: 'application/json',
      },
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Info not found');
    }

    const data = (await res.json()) as InfoResponse;
    return data;
  };

  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['info'],
    mutationFn: getInfo,
  });

  return {
    isPending,
    mutateAsync,
  };
}
