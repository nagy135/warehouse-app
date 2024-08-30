import React, { useState } from "react";
import { Text } from "~/components/ui/text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { View } from "react-native";
import { Input } from "~/components/ui/input";
import useScanner from "~/lib/hooks/use-scanner";

export default function CountModal({
  open,
  setClose,
  onConfirm,
}: {
  open: boolean;
  setClose: () => void;
  onConfirm: (count: number, skuVariantSKU: string) => void;
}) {
  const { startScan, scanning } = useScanner({
    mockData: "sweetwaffles50123",
    onScan: (data) => {
      onConfirm(Number(count), data);
      setClose();
    },
  });
  const [count, setCount] = useState("");

  const onChangeCount = (text: string) => {
    setCount(text.replace(/[^0-9]/g, ""));
  };
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <View>
              <Text className="font-extrabold text-lg">
                Count how many items
              </Text>
            </View>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <View className="h-12">
              <Input
                className="h-5 rounded-md"
                keyboardType="numeric"
                placeholder="How many items are we moving"
                value={count.toString()}
                onChangeText={onChangeCount}
              />
            </View>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={setClose}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={() => startScan()}>
            <Text>{scanning ? "..." : "From"}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
