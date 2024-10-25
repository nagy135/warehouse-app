import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { EntryExitStatesEnum, type Exit } from "~/lib/types";
import { cn } from "~/lib/utils";

export default function ExitCard({ exit }: { exit: Exit }) {
  const { t } = useTranslation()
  return (
    <Card className={cn('w-full', exit.state === EntryExitStatesEnum.MOVED && 'bg-green-100')}>
      <TouchableOpacity
        onPress={() => {
          /* @ts-ignore */
          router.push({ pathname: "/logged-in/exit-detail", params: exit });
        }}
      >
        <CardHeader>
          <CardTitle>{exit.name}</CardTitle>
          <CardDescription>{t('exit-list.exit-number')}: {exit.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>{t(`state.${exit.state}`)}</Text>
        </CardContent>
        <CardFooter>
          <Text>{t('dateTime', { date: exit.createdAt })}</Text>
        </CardFooter>
      </TouchableOpacity>
    </Card>
  );
}
