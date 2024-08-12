import { useEffect, useState } from "react";
import * as ExpoZebraScanner from "expo-zebra-scanner";

const randomString = () => Math.random().toString(36).slice(2, 7);

export default function useScanner() {

	const [data, setData] = useState<string | null>(null);
	const [label, setLabel] = useState<string | null>(null);
	const [scanning, setScanning] = useState(false);
	useEffect(() => {

		if (process.env.MOCK_SCANNER === "true") {
			setData("mocked_" + randomString());
			setLabel("mocked_" + randomString());
			setScanning(false);
			return
		}

		const listener = ExpoZebraScanner.addListener(event => {

			const { scanData, scanLabelType } = event;
			setData(scanData ?? 'nothing data');
			setLabel(scanLabelType ?? 'nothing label');

			setScanning(false);

		});
		ExpoZebraScanner.startScan();


		return () => {
			ExpoZebraScanner.stopScan();
			listener.remove();
		}

	}, [scanning]);

	return {
		data,
		label,
		scanning,
		startScan: () => setScanning(true),
	}
}
