import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";

import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/theme-toggle";
import { SessionProvider, useSession } from "~/ctx";
import { Button } from "~/components/ui/button";
import { useColorScheme } from "~/lib/useColorScheme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                animation: "slide_from_left",
                title: "Warehouse App",
                headerRight: () => <ThemeToggle />,
              }}
            />
            <Stack.Screen
              name="logged-in"
              options={{
                animation: "slide_from_right",
                title: "Actions",
                headerRight: () => <ThemeProfile />,
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SessionProvider>
      <PortalHost />
    </ThemeProvider>
  );
}

const ThemeProfile = () => {
  const { signOut } = useSession();
  return (
    <View className="flex-row gap-1">
      <ThemeToggle />
      <Button
        variant="secondary"
        onPress={() => {
          signOut();
        }}
      >
        <Text>Log out</Text>
      </Button>
    </View>
  );
};
