import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

export default function CountModal({
  open,
  setClose,
  onConfirm,
  productName,
}: {
  open: boolean;
  setClose: () => void;
  onConfirm: (count: number) => void;
  productName?: string;
}) {
  const [count, setCount] = useState('');
  const { t } = useTranslation();

  const onChangeCount = (text: string) => {
    setCount(text.replace(/[^0-9]/g, ''));
  };

  useEffect(() => {
    if (!open) {
      setCount('');
    }
  }, [open]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="h-14">
            <View>
              <Text className="text-lg">
                {`${t('count-modal.product')}: `}
                <Text className="text-lg font-bold">{productName}</Text>
              </Text>
            </View>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <View className="h-12">
              <Input
                autoFocus
                className="h-5 w-full rounded-md"
                keyboardType="numeric"
                placeholder={t('count-modal.number-of-items')}
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
            <Text>{t('count-modal.ok')}</Text>
          </AlertDialogCancel>
          <AlertDialogCancel onPress={setClose}>
            <Text>{t('count-modal.cancel')}</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
