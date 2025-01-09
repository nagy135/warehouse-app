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
import { useTranslation } from "react-i18next";

export default function ReturnOrClaimModal({
  open,
  onConfirm,
  title,
  description,
}: {
  title: string;
  description: ReactNode;
  open: boolean;
  onConfirm: (type: 'return' | 'claim') => void;
}) {
  const { t } = useTranslation()
  console.log("open", open)
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onPress={() => onConfirm('return')}>
            <Text>{t('return-detail.return')}</Text>
          </AlertDialogAction>
          <AlertDialogAction onPress={() => onConfirm('claim')}>
            <Text>{t('return-detail.claim')}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
