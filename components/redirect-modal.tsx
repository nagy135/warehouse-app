import React, { ReactNode } from "react";
import { Text } from "./ui/text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { View } from "react-native";
import { Href, router } from "expo-router";

export default function RedirectModal({
  open,
  title,
  description,
  hrefObject,
  setClose,
}: {
  open: boolean;
  title: string;
  description: string | ReactNode;
  hrefObject: Href<string | object>;
  setClose: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <View className="flex items-end"></View>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={setClose}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={() => {
              router.push(hrefObject);
              setClose();
            }}
          >
            <Text>Go</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
