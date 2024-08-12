import { View, Text } from "react-native";
import { Button } from "./ui/button";
import useScanner from "~/lib/hooks/use-scanner";

export default function ZebraScanner() {

	const { data, label, startScan, scanning } = useScanner();

	return (
		<View>
			<Button onPress={() => startScan()}><Text>Start Scan</Text></Button>
			<Text>{scanning ? 'SCANNING' : 'not scanning'}</Text>
			<Text>{`data: ${data}`}</Text>
			<Text>{`label: ${label}`}</Text>
		</View>
	);
}
