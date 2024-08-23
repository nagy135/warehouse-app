import { View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import useScanner from "~/lib/hooks/use-scanner";

export default function Scanner() {
  const { data, label, startScan, scanning } = useScanner();

  return (
    <View className="flex-1">
      <Button onPress={() => startScan()} size="lg">
        <Text className=" text-2xl font-bold">SCAN!</Text>
      </Button>

      {scanning && <Text className="text-2xl font-bold">Scanning...</Text>}

      {data && label && (
        <>
          <Text>{`data: ${data}`}</Text>
          <Text>{`label: ${label}`}</Text>
        </>
      )}
    </View>
  );
}
