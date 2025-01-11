import React, { ReactNode } from "react";
import { Text } from "~/components/ui/text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export default function NotificationModal({
  open,
  setClose,
  title,
  description,
  variant = "default",
}: {
  title: string;
  description: ReactNode;
  open: boolean;
  variant?: "default" | "danger";
  setClose: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className={variant == "danger" ? "border-2 border-red-500" : ""}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={variant === "danger" ? "color-red-500" : ""}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onPress={setClose}>
            <Text>OK</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
