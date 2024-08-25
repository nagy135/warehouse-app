import { useQuery } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { isEnvVar } from "~/lib/utils";

export default function useRecordDetail<T>(
  id: number,
  path: string
): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { session } = useSession();
  const fetchRecords = async () => {
    if (isEnvVar("DEBUG", true))
      console.log(`fetching: ${API_ROOT}/${path}?id=${id}`);

    const res = await fetch(`${API_ROOT}/${path}?id=${id}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: [`get-${path}-detail`],
    queryFn: fetchRecords,
  });
  return { data, error, isLoading };
}
