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
	const [fromStorageSKU, setFromStorageSKU] = useState<string | undefined>(
		undefined
	);
	const [toStorageSKU, setToStorageSKU] = useState<string | undefined>(
		undefined
	);
	const { modal, setOpen: openModal } = useNotificationModal({
		title: "Scan values first",
		description: "Scan product SKU and storages SKU first before transferring.",
	});

	const { mutate } = useTransferProductToStorage({
		onSuccessCallback: () => {
			setProductSkuVariantSKU(undefined);
			setFromStorageSKU(undefined);
			setToStorageSKU(undefined);
		},
	});

	return (
		<View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
			<View className="flex justify-center gap-3 w-full">
				<Scanner
					label="Product SKU"
					mockData="sweetwaffles50123"
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
					label="FROM Storage SKU"
					mockData="spotexactlyforwaffles123"
					onScan={(data) => {
						setFromStorageSKU(data);
					}}
				/>
				{fromStorageSKU && (
					<View>
						<Text>{`FROM Storage: ${fromStorageSKU}`}</Text>
					</View>
				)}
				<Scanner
					label="TO Storage SKU"
					mockData="secondspotexactlyforsourwaffles123"
					onScan={(data) => {
						setToStorageSKU(data);
					}}
				/>
				{toStorageSKU && (
					<View>
						<Text>{`TO Storage: ${toStorageSKU}`}</Text>
					</View>
				)}
				<View className="flex flex-row justify-center gap-3 mt-5">
					<Button
						variant="secondary"
						className="flex-1 border"
						onPress={() => {
							if (!productSkuVariantSKU || !fromStorageSKU || !toStorageSKU) {
								openModal();
							} else {
								mutate({ productSkuVariantSKU, fromStorageSKU, toStorageSKU });
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
							setFromStorageSKU(undefined);
							setToStorageSKU(undefined);
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
