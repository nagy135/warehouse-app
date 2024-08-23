import React from "react";
import { Button } from "./ui/button";
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
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { View } from "react-native";

export default function ConfirmationModal({
  buttonTitle,
  onConfirm,
}: {
  buttonTitle: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <View className="flex items-end">
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <Text>{buttonTitle}</Text>
          </Button>
        </AlertDialogTrigger>
      </View>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm}>
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
