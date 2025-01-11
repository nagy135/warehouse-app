import React, { ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
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
} from '~/components/ui/alert-dialog';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ConfirmationModal({
  title,
  description,
  buttonTitle,
  button,
  onConfirm,
}: {
  buttonTitle?: string;
  title?: string;
  description?: string;
  button?: ReactNode;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog>
      <View className="flex items-end">
        <AlertDialogTrigger asChild>
          {button ? (
            button
          ) : (
            <Button size="lg" variant="outline">
              <Text>
                {buttonTitle ??
                  t('confirmation-modal.action-can-not-be-undone')}
              </Text>
            </Button>
          )}
        </AlertDialogTrigger>
      </View>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? '-'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? t('confirmation-modal.are-you-sure')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>{t('confirmation-modal.cancel')}</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm}>
            <Text>{t('confirmation-modal.continue')}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
