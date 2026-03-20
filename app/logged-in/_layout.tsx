import { useTheme } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { ChevronLeft, MoveRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { Text } from '~/components/ui/text';

import { useSession } from '../../ctx';
import { useTranslation } from 'react-i18next';

export default function ActionLayout() {
  const { session, isLoading } = useSession();
  const { t } = useTranslation();

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
        header: (props) => <CompactHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('titles.home'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="exits-index"
        options={{
          title: t('titles.exits'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="exit-detail"
        options={{
          title: t('titles.exit'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="move-index"
        options={{
          title: t('titles.move'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="move-storage"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo
              from={t('titles.storage')}
              to={t('titles.new-position')}
            />
          ),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="move-storage-items"
        options={{
          title: t('titles.move-items'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="move-product"
        options={{
          headerTitle: () => (
            <MoveArrowFromTo
              from={t('titles.product')}
              to={t('titles.new-position')}
            />
          ),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: t('inventory.title'),
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

const CompactHeader = ({
  options,
  route,
  back,
  navigation,
}: NativeStackHeaderProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const title =
    options.title ??
    (typeof options.headerTitle === 'string'
      ? options.headerTitle
      : route.name);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        height: insets.top,
        paddingHorizontal: 12,
      }}
    >
      <View className="flex-1 flex-row items-center">
        <View className="w-12 items-start justify-center">
          {back ? (
            <Pressable
              className="h-10 w-10 items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color={colors.text} size={22} />
            </Pressable>
          ) : null}
        </View>
        <View className="flex-1 items-center justify-center px-2">
          {typeof options.headerTitle === 'function' ? (
            options.headerTitle({
              children: title,
              tintColor: colors.text,
            })
          ) : (
            <Text className="text-2xl font-semibold" numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
        <View className="w-12" />
      </View>
    </View>
  );
};

const MoveArrowFromTo = ({ from, to }: { from: string; to: string }) => {
  return (
    <View className="flex flex-row items-center">
      <Text className="mr-1 text-lg font-semibold">{`${from} `}</Text>
      <MoveRight color="#ea6962" size={20} />
      <Text className="ml-1 text-lg font-semibold">{` ${to}`}</Text>
    </View>
  );
};
