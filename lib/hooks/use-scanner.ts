import { useEffect, useState } from "react";
import { isEnvVar } from "../utils";

const randomString = () => Math.random().toString(36).slice(2, 7);

export default function useScanner({
  onScan,
}: {
  onScan?: (data: string, label: string) => void;
}) {
  const [data, setData] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    if (!scanning) return;
    if (isEnvVar("MOCK_SCANNER", true)) {
      setTimeout(() => {
        const scanLabelType = randomString();
        const scanData = "123billa";

        setData(scanData);
        setLabel(scanLabelType);
        setScanning(false);

        if (onScan) onScan(scanData, scanLabelType);
      }, 500);
    } else {
      // NOTE: this is just to allow development where android modules are not available
      // if this causes any issues in the production, just remove the mock entirely
      // and import the module directly
      import("expo-zebra-scanner").then(({ default: ExpoZebraScanner }) => {
        const listener = ExpoZebraScanner.addListener((event) => {
          const { scanData, scanLabelType } = event;
          setData(scanData ?? "nothing data");
          setLabel(scanLabelType ?? "nothing label");

          setScanning(false);
          if (onScan) onScan(scanData, scanLabelType);
        });
        ExpoZebraScanner.startScan();

        return () => {
          ExpoZebraScanner.stopScan();
          listener.remove();
        };
      });
    }
  }, [scanning]);

  return {
    data,
    label,
    scanning,
    startScan: () => setScanning(true),
  };
}
