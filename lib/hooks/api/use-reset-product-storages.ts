import { useMutation } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { isEnvVar } from "~/lib/utils";

export default function useChangeProductStorageState({
  onSuccessCallback,
}: {
  onSuccessCallback: () => void;
}): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (args: { ids: number[]; change: "counted" | "not-counted" }) => void;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    ids,
    change,
  }: {
    ids: number[];
    change: "counted" | "not-counted";
  }) => {
    const path = `${API_ROOT}/product-storages/${change}`;
    if (isEnvVar("DEBUG", true)) console.log(`changing: ${path}`);

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: "application/json",
      },
      body: JSON.stringify({ ids }),
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
    mutate: (args: { ids: number[]; change: "counted" | "not-counted" }) =>
      mutate(args),
  };
}
