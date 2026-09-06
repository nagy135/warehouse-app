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
import { EntryExitStatesEnum, type CrossDock } from '~/lib/types';
import { cn } from '~/lib/utils';
import { ShieldCheck } from '~/lib/icons';

function CrossDockCardComponent({
  crossDock,
  delivery,
  partner,
}: {
  crossDock: CrossDock;
  delivery: string;
  partner: string;
}) {
  const { t } = useTranslation();

  const cardClassName = useMemo(() => {
    return cn(
      'w-full',
      crossDock.state === EntryExitStatesEnum.MOVED ||
        crossDock.state === EntryExitStatesEnum.PACKAGED ||
        crossDock.state === EntryExitStatesEnum.SENT
        ? 'bg-green-100'
        : '',
      crossDock.isIncomplete && 'bg-red-100',
    );
  }, [crossDock.state, crossDock.isIncomplete]);

  const stateLabel = useMemo(
    () => t(`state.${crossDock.state}`),
    [crossDock.state, t],
  );

  return (
    <Card className={cardClassName}>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/logged-in/cross-dock-detail',
            // @ts-ignore
            params: crossDock,
          });
        }}
      >
        <CardHeader>
          <CardTitle>{crossDock.name}</CardTitle>
          <CardDescription>
            {t('cross-dock-list.cross-dock-number')}: {crossDock.id}
            {'\n'}
            {t('delivery')}: {delivery}
            {'\n'}
            {t('partner')}: {partner}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-row items-center justify-between">
          <Text>{stateLabel}</Text>
          {crossDock.isIncomplete && (
            <Badge variant="destructive">
              <Text>{t('cross-dock-list.incomplete')}</Text>
            </Badge>
          )}
          {crossDock.priority && (
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
          <Text>{t('dateTime', { date: crossDock.createdAt })}</Text>
        </CardFooter>
      </TouchableOpacity>
    </Card>
  );
}

export default React.memo(CrossDockCardComponent);
