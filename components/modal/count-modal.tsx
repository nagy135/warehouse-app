import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

export default function CountModal({
  open,
  setClose,
  onConfirm,
  productName
}: {
  open: boolean;
  setClose: () => void;
  onConfirm: (count: number) => void;
  productName?: string;
}) {
  const [count, setCount] = useState("");

  const onChangeCount = (text: string) => {
    setCount(text.replace(/[^0-9]/g, ""));
  };

  useEffect(() => {
    if (!open) {
      setCount('')
    }
  }, [open])
  
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="h-14">
            <View>
              <Text className="font-extrabold text-lg">
                {`Product: ${productName}`}
              </Text>
            </View>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <View className="h-12">
              <Input
                className="h-5 rounded-md w-full"
                keyboardType="numeric"
                placeholder="number of items"
                value={count.toString()}
                onChangeText={onChangeCount}
              />
            </View>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onPress={() => {
              onConfirm(Number(count));
              setClose();
            }}
          >
            <Text>Ok</Text>
          </AlertDialogCancel>
          <AlertDialogCancel onPress={setClose}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
