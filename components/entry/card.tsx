import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { EntryStatesEnum, type Entry } from '~/lib/types'
import { cn } from '~/lib/utils'

export default function EntryCard({ entry }: { entry: Entry }) {
    console.log('entry', entry)
    const { t } = useTranslation()
    return (
        <Card className={cn('w-full', entry.state === EntryStatesEnum.MOVED && 'bg-green-100')}>
            <TouchableOpacity
                onPress={() => {
                    // @ts-ignore
                    router.push({ pathname: '/logged-in/entry-detail', params: entry })
                }}
            >
                <CardHeader>
                    <CardTitle>{entry.name}</CardTitle>
                    <CardDescription>
                        {t('entryNumber')} {entry.id}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Text>{t(`state.${entry.state}`)}</Text>
                </CardContent>
                <CardFooter>
                    <Text>{t('dateTime', { date: entry.createdAt })}</Text>
                </CardFooter>
            </TouchableOpacity>
        </Card>
    )
}
