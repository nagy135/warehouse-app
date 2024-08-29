import { View } from "react-native";

import { Text } from "~/components/ui/text";
import { Redirect, Stack } from "expo-router";

import { useSession } from "../../ctx";
import { MoveRight } from "lucide-react-native";

export default function ActionLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
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
          title: "Home",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="storages-group"
        options={{
          title: "Storages",
          animation: "fade_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="entries-index"
        options={{
          title: "Entries",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="entry-detail"
        options={{
          title: "Entry",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="exits-index"
        options={{
          title: "Exits",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="exit-detail"
        options={{
          title: "Exit",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="move-index"
        options={{
          title: "Move",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="move-position"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo from="storage" to="new position" />
          ),
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="move-storage"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo from="product" to="new storage" />
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
