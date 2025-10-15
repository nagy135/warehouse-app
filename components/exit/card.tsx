import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { EntryExitStatesEnum, type Exit } from '~/lib/types';
import { cn } from '~/lib/utils';
import { ShieldCheck } from '~/lib/icons/ShieldCheck';

function ExitCardComponent({ exit }: { exit: Exit }) {
  const { t } = useTranslation();

  const cardClassName = useMemo(() => {
    return cn(
      'w-full',
      (exit.state === EntryExitStatesEnum.MOVED ||
        exit.state === EntryExitStatesEnum.PACKAGED ||
        exit.state === EntryExitStatesEnum.SENT)
        ? 'bg-green-100'
        : '',
      exit.isIncomplete && 'bg-red-100',
    );
  }, [exit.state, exit.isIncomplete]);

  const stateLabel = useMemo(() => t(`state.${exit.state}`), [exit.state, t]);

  return (
    <Card className={cardClassName}>
      <TouchableOpacity
        onPress={() => {
          /* @ts-ignore */
          router.push({ pathname: '/logged-in/exit-detail', params: exit });
        }}
      >
        <CardHeader>
          <CardTitle>{exit.name}</CardTitle>
          <CardDescription>
            {t('exit-list.exit-number')}: {exit.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-row items-center justify-between">
          <Text>{stateLabel}</Text>
          {exit.isIncomplete && (
            <Badge variant="destructive">
              <Text>{t('exit-list.incomplete')}</Text>
            </Badge>
          )}
          {exit.priority && (
            <Badge variant="blue">
              <ShieldCheck
                className="mr-1 text-foreground"
                size={20}
                strokeWidth={1.25}
              />
            </Badge>
          )}
        </CardContent>
        <CardFooter>
          <Text>{t('dateTime', { date: exit.createdAt })}</Text>
        </CardFooter>
      </TouchableOpacity>
    </Card>
  );
}

export default React.memo(ExitCardComponent);
