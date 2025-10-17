import * as ExpoZebraScanner from 'expo-zebra-scanner';
import { useEffect, useState } from 'react';

const randomString = () => Math.random().toString(36).slice(2, 7);

export default function useScanner({
  onScan,
  mockData,
}: {
  onScan?: (data: string, label: string) => void;
  mockData?: string;
}) {
  const [data, setData] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    if (scanning && process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true') {
      setTimeout(() => {
        const scanLabelType = randomString();
        const scanData = 'SB2';

        setData(scanData);
        setLabel(scanLabelType);
        setScanning(false);

        if (onScan) onScan(mockData ? mockData : scanData, scanLabelType);
      }, 500);
    }
    // production mode
    // const listener = ExpoZebraScanner.addListener((event) => {
    //   const { scanData, scanLabelType } = event;
    //   setData(scanData ?? 'nothing data');
    //   setLabel(scanLabelType ?? 'nothing label');

    //   setScanning(false);
    //   if (onScan) onScan(scanData, scanLabelType);
    // });
    // ExpoZebraScanner.startScan();

    // return () => {
    //   ExpoZebraScanner.stopScan();
    //   listener.remove();
    // };
  }, [scanning]);

  return {
    data,
    label,
    scanning,
    startScan: () => setScanning(true),
  };
}
