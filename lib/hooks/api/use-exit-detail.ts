import { useQuery } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";
import { Exit } from "~/lib/types";
import { isEnvVar } from "~/lib/utils";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function useExitDetail(id: number): {
	data: Exit | undefined,
	isLoading: boolean,
	error: Error | null,
} {
	const { session } = useSession();
	const fetchRecords = async () => {
		if (isEnvVar('DEBUG', true)) console.log(`fetching: ${API_ROOT}/exit?id=${id}`);

		const res = await fetch(`${API_ROOT}/exit?id=${id}`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		sleep(1000);
		const data = await res.json();
		return data;
	};

	const { data, error, isLoading } = useQuery({ queryKey: ['get-exit-detail'], queryFn: fetchRecords });
	return { data, error, isLoading };
}
