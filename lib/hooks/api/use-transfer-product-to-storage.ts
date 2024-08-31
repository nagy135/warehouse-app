import { useMutation } from "@tanstack/react-query";
import { useSession } from "~/ctx";
import { API_ROOT } from "~/lib/constants";

export default function useTransferProductToStorage({
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
		productSkuVariantSKU: string;
		fromStorageSKU: string;
		toStorageSKU: string;
	}) => void;
} {
	const { session } = useSession();
	const mutateRecords = async ({
		productSkuVariantSKU,
		fromStorageSKU,
		toStorageSKU,
	}: {
		productSkuVariantSKU: string;
		fromStorageSKU: string;
		toStorageSKU: string;
	}) => {
		const path = `${API_ROOT}/product-sku-variant/transfer`;
		if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == "true") {
      		console.log(`changing: ${path}`);
    	}

		const res = await fetch(path, {
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
				ContentType: "application/json",
			},
			body: JSON.stringify({
				productSkuVariantSKU,
				fromStorageSKU,
				toStorageSKU,
			}),
			method: "POST",
		});
		const data = await res.json();
		if (!res.ok) {
			throw new Error(JSON.stringify(data.error ?? "unknown"));
		}

		if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == "true") {
			console.log(`returned: ${JSON.stringify(data)}`);
		}
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
