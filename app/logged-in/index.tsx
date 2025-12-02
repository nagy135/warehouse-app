import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useSession } from '~/ctx';

export default function LoggedInPage() {
  const { session } = useSession();
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <Text className="text-2xl font-bold">{t('welcome')}</Text>
      <Text className="text-md">{session?.email ?? '-'}</Text>
      <View className="w-full flex-1 justify-center gap-5 p-3">
        <Link href="/logged-in/exits-index" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>{t('exits')}</Text>
          </Button>
        </Link>
        <Link href="/logged-in/move-index" asChild>
          <Button className="text-2xl font-bold" variant="outline" size="lg">
            <Text>{t('move')}</Text>
          </Button>
        </Link>
        <Link href="/logged-in/inventory" asChild>
          <Button className="text-2xl font-bold bg-blue-500" size="lg">
            <Text>{t('inventory.title')}</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
