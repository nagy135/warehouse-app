import React, { useEffect, useState } from "react";
import * as ExpoZebraScanner from "expo-zebra-scanner";
import { View, Text } from "react-native";

export default function ZebraScanner() {

	const [data, setData] = useState("-");
	useEffect(() => {

		const listener = ExpoZebraScanner.addListener(event => {

			const { scanData, scanLabelType } = event;
			if (scanData) setData(scanData);
			console.log("================\n", "scanLabelType: ", scanLabelType, "\n================");
			console.log("================\n", "scanData: ", scanData, "\n================");
			// ...

		});
		ExpoZebraScanner.startScan();


		return () => {
			ExpoZebraScanner.stopScan();
			listener.remove();
		}

	}, [])

	return (
		<View>
			<Text>Zebra Barcode Scanner</Text>
			<Text>{data}</Text>
		</View>
	);
}
