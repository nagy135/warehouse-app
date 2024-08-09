import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "../constants";
import { useEffect, useRef } from "react";


export default function useGetRecords<T>(apiKey: string, search?: string): UseQueryResult<T[]> {
	const { session } = useSession();
	const queryClient = useQueryClient()

	const handleRef = useRef<NodeJS.Timeout | null>(null);

	const searchString = search ? new URLSearchParams({
		search
	}).toString() : '';


	useEffect(() => {
		if (handleRef.current) clearTimeout(handleRef.current);

		handleRef.current = setTimeout(() => {
			queryClient.invalidateQueries({ queryKey: [apiKey] });
		}, 1000);
	}, [search])

	const fetchRecords = async () => {
		console.log(`fetching: ${API_ROOT}/${apiKey}?${searchString}`);
		const res = await fetch(`${API_ROOT}/${apiKey}?${searchString}`, {
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
