import { useMutation } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { isEnvVar } from "~/lib/utils";

export default function useTransferProductToStorage({
  onSuccessCallback,
}: {
  onSuccessCallback: () => void;
}): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (args: { productSkuVariantSKU: string; storageSKU: string }) => void;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    productSkuVariantSKU,
    storageSKU,
  }: {
    productSkuVariantSKU: string;
    storageSKU: string;
  }) => {
    const path = `${API_ROOT}/product-sku-variant/transfer`;
    if (isEnvVar("DEBUG", true)) console.log(`changing: ${path}`);

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: "application/json",
      },
      body: JSON.stringify({ productSkuVariantSKU, storageSKU }),
      method: "POST",
    });
    const data = await res.json();
    return data;
  };

  const { isPending, isError, isSuccess, mutate } = useMutation({
    mutationKey: [`reset-product-storages`],
    mutationFn: mutateRecords,
    onSuccess: onSuccessCallback,
  });
  return {
    isPending,
    isError,
    isSuccess,
    mutate: (args) => mutate(args),
  };
}
