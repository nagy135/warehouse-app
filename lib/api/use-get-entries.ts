import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { Entry } from "../types";
import { API_ROOT } from "../constants";

type EntryWrap = {
	entries: Entry[];
}

export default function useGetEntries(): UseQueryResult<EntryWrap> {
	const { session } = useSession();

	const fetchEntries = async () => {
		const res = await fetch(`${API_ROOT}/entries`, {
			headers: {
				'Authorization': `Bearer ${session?.accessToken}`
			}
		});
		const data = await res.json();
		return data;
	};

	const query = useQuery({ queryKey: ['entries'], queryFn: fetchEntries });

	return query;
}
