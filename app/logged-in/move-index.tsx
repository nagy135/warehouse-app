import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function MovePage() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <View className="w-full flex-1 justify-center gap-5 p-3">
        {/* @ts-ignore */}
        <Link href="/logged-in/move-product" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>{t('move-section.product')}</Text>
          </Button>
        </Link>
        {/* @ts-ignore */}
        <Link href="/logged-in/move-storage" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>{t('move-section.storage')}</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
