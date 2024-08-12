import React, { useEffect, useState } from "react";
import * as ExpoZebraScanner from "expo-zebra-scanner";
import { View, Text } from "react-native";
import { Button } from "./ui/button";

export default function ZebraScanner() {

	const [data, setData] = useState("-");
	const [label, setLabel] = useState("-");
	const [scanning, setScanning] = useState(false);

	useEffect(() => {

		const listener = ExpoZebraScanner.addListener(event => {

			const { scanData, scanLabelType } = event;
			setData(scanData ?? 'nothing data');
			setLabel(scanLabelType ?? 'nothing label');

		});
		ExpoZebraScanner.startScan();


		return () => {
			ExpoZebraScanner.stopScan();
			listener.remove();
		}

	}, [scanning])

	return (
		<View>
			<Button onPress={() => setScanning(true)}><Text>Start Scan</Text></Button>
			<Text>{`data: ${data}`}</Text>
			<Text>{`label: ${label}`}</Text>
		</View>
	);
}
