import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "../constants";

export default function useGetRecords<T>(apiKey: string): UseQueryResult<T[]> {
	const { session } = useSession();

	const fetchRecords = async () => {
		const res = await fetch(`${API_ROOT}/${apiKey}`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		const data = await res.json();
		return data;
	};

	const query = useQuery({ queryKey: [apiKey], queryFn: fetchRecords });

	return query;
}
