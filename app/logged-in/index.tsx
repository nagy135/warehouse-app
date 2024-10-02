import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useSession } from "~/ctx";

export default function LoggedInPage() {
  const { session } = useSession();
  const { t } = useTranslation()
  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Text className="font-bold text-2xl">Welcome!</Text>
      <Text className="text-md">{session?.email ?? "-"}</Text>
      <View className="flex-1 justify-center w-full gap-5 p-3">
        {/* @ts-ignore */}
        <Link href="/logged-in/entries-index" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>{t('entries')}</Text>
          </Button>
        </Link>
        {/* @ts-ignore */}
        <Link href="/logged-in/exits-index" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>{t('exits')}</Text>
          </Button>
        </Link>
        {/* @ts-ignore */}
        <Link href="/logged-in/move-index" asChild>
          <Button className="text-2xl font-bold" variant="outline" size="lg">
            <Text>{t('move')}</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
