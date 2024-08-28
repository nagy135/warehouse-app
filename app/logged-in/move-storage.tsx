import { View } from "react-native";
import Scanner from "~/components/scanner";

export default function MoveStoragePage() {
	return (
		<View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
			<View className="flex border-red-50 border justify-center gap-3 w-full">
				<Scanner
					label="Product SKU"
					onScan={(data) => {
						console.log(data);
					}}
				/>
				<Scanner
					label="Storage SKU"
					onScan={(data) => {
						console.log(data);
					}}
				/>
			</View>
		</View>
	);
}
