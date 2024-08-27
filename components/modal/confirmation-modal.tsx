import React, { ReactNode } from "react";
import { Button } from "~/components/ui/button";
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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { View } from "react-native";

export default function ConfirmationModal({
  title,
  description = "Are you sure?",
  buttonTitle = "This action cant be undone",
  button,
  onConfirm,
}: {
  buttonTitle?: string;
  title?: string;
  description?: string;
  button?: ReactNode;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <View className="flex items-end">
        <AlertDialogTrigger asChild>
          {button ? (
            button
          ) : (
            <Button size="lg" variant="outline">
              <Text>{buttonTitle ?? "-"}</Text>
            </Button>
          )}
        </AlertDialogTrigger>
      </View>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? "-"}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? "-"}</AlertDialogDescription>
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
