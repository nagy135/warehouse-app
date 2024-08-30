import { useMutation } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { isEnvVar } from "~/lib/utils";

export default function useTransferEntryOrExitProductStorages({
  onSuccessCallback,
  onErrorCallback,
}: {
  onSuccessCallback: () => void;
  onErrorCallback: () => void;
}): {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: string;
  mutate: (args: {
    exitId?: number;
    entryId?: number;
    toStorageSKU: string;
  }) => void;
} {
  const { session } = useSession();
  const mutateRecords = async ({
    exitId,
    entryId,
    toStorageSKU,
  }: {
    exitId?: number;
    entryId?: number;
    toStorageSKU: string;
  }) => {
    const path = `${API_ROOT}/${exitId ? "exit" : "entry"}/transfer`;
    if (isEnvVar("DEBUG", true)) console.log(`changing: ${path}`);

    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        ContentType: "application/json",
      },
      body: JSON.stringify({
        id: exitId ? exitId : entryId,
        toStorageSKU,
      }),
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data.error ?? "unknown"));
    }

    if (isEnvVar("DEBUG", true))
      console.log(`returned: ${JSON.stringify(data)}`);
    return data;
  };

  const { isPending, isError, isSuccess, mutate, error } = useMutation({
    mutationFn: mutateRecords,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });
  return {
    isPending,
    isError,
    isSuccess,
    error: error?.message ?? "",
    mutate: (args) => mutate(args),
  };
}
