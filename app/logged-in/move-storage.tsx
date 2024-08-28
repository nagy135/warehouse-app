import { useState } from "react";
import { View } from "react-native";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useTransferProductToStorage from "~/lib/hooks/api/use-transfer-product-to-storage";
import useNotificationModal from "~/lib/hooks/use-notification-modal";

export default function MoveStoragePage() {
	const [productSkuVariantSKU, setProductSkuVariantSKU] = useState<
		string | undefined
	>(undefined);
	const [storageSKU, setStorageSKU] = useState<string | undefined>(undefined);
	const { modal, setOpen: openModal } = useNotificationModal({
		title: "Scan values first",
		description: "Scan product SKU and storage SKU first before transferring.",
	});

	const { mutate } = useTransferProductToStorage({
		onSuccessCallback: () => {
			setProductSkuVariantSKU(undefined);
			setStorageSKU(undefined);
		},
	});

	return (
		<View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
			<View className="flex justify-center gap-3 w-full">
				<Scanner
					label="Product SKU"
					mockData="123"
					onScan={(data) => {
						setProductSkuVariantSKU(data);
					}}
				/>
				{productSkuVariantSKU && (
					<View>
						<Text>{`Product: ${productSkuVariantSKU}`}</Text>
					</View>
				)}
				<Scanner
					label="Storage SKU"
					mockData="STORAGE-1234"
					onScan={(data) => {
						setStorageSKU(data);
					}}
				/>
				{storageSKU && (
					<View>
						<Text>{`Storage: ${storageSKU}`}</Text>
					</View>
				)}
				<View className="flex flex-row justify-center gap-3 mt-5">
					<Button
						variant="secondary"
						className="flex-1 border"
						onPress={() => {
							if (!productSkuVariantSKU || !storageSKU) {
								openModal();
							} else {
								mutate({ productSkuVariantSKU, storageSKU });
							}
						}}
					>
						<Text>Transfer</Text>
					</Button>
					<Button
						variant="destructive"
						className="w-1/3"
						onPress={() => {
							setProductSkuVariantSKU(undefined);
							setStorageSKU(undefined);
						}}
					>
						<Text>Reset</Text>
					</Button>
				</View>
			</View>
			{modal}
		</View>
	);
}
