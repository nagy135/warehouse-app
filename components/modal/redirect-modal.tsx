import React, { ReactNode } from "react";
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
import { Href, router } from "expo-router";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation()
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
            <Text>{t('redirect-modal.cancel')}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={() => {
              router.push(hrefObject);
              setClose();
            }}
          >
            <Text>{t('redirect-modal.continue')}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
