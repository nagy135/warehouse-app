import { useQuery } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { Entry } from "~/lib/types";
import { isEnvVar } from "~/lib/utils";

export default function useEntryDetail(id: number): {
	data: Entry | undefined,
	isLoading: boolean,
	error: Error | null,
} {
	const { session } = useSession();
	const fetchRecords = async () => {
		if (isEnvVar('DEBUG', true)) console.log(`fetching: ${API_ROOT}/entry?id=${id}`);

		const res = await fetch(`${API_ROOT}/entry?id=${id}`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		const data = await res.json();
		return data;
	};

	const { data, error, isLoading } = useQuery({ queryKey: ['get-entry-detail'], queryFn: fetchRecords });
	return { data, error, isLoading };
}
