import { View } from "react-native";
import { Button, ButtonProps } from "./ui/button";
import { Text } from "./ui/text";
import useScanner from "~/lib/hooks/use-scanner";

export default function Scanner({
	size = "lg",
	onScan,
}: {
	size?: ButtonProps["size"];
	onScan?: (data: string, label: string) => void;
}) {
	const { startScan, scanning } = useScanner({ onScan });

	return (
		<View className="flex-1">
			<Button onPress={() => startScan()} size={size}>
				<Text className=" text-2xl font-bold">{scanning ? "..." : "Scan"}</Text>
			</Button>
		</View>
	);
}
