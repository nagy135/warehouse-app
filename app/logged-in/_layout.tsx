import { View } from "react-native";

import { Text } from "~/components/ui/text";
import { Redirect, Stack } from "expo-router";

import { useSession } from "../../ctx";
import { MoveRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function ActionLayout() {
  const { session, isLoading } = useSession();
  const { t } = useTranslation()

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>{t('loading')}</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('titles.home'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="storages-group"
        options={{
          title: t('titles.storages'),
          animation: "fade_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="entries-index"
        options={{
          title: t('titles.entries'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="entry-detail-second-step"
        options={{
          title: "Entry choose storage",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="entry-detail"
        options={{
          title: t('titles.entry'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="exits-index"
        options={{
          title: t('titles.exits'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="exit-detail"
        options={{
          title:t('titles.exit'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="move-index"
        options={{
          title: t('titles.move'),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="move-position"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo from={t('titles.storage')} to={t('titles.new-position')} />
          ),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="move-product"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo from={t('titles.product')} to={t('titles.new-storage')} />
          ),
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}

const MoveArrowFromTo = ({ from, to }: { from: string; to: string }) => {
  return (
    <View className="flex flex-row">
      <Text className="text-2xl">{`${from} `}</Text>
      <MoveRight color="#ea6962" size={32} />
      <Text className="text-2xl">{` ${to}`}</Text>
    </View>
  );
};
