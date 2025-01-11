import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Text } from '~/components/ui/text'
import { Package } from '~/lib/types'
import { cn } from '~/lib/utils'

const minWidth = 120;

export default function PackageList({
    data,
    scannedTrackingNumbers
}: {
    data?: Package[]
    scannedTrackingNumbers: Set<string>
}) {
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()
    const { width } = useWindowDimensions()

    const columnWidths = React.useMemo(() => {
        const evenWidth = width / 2
        return evenWidth > minWidth ? evenWidth : minWidth
    }, [width])

    return (
        <>
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
                <Table aria-labelledby="productstorage-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead style={{ width: columnWidths }}>
                                <Text className="text-center font-bold text-md">{t('return-detail.tracking-number')}</Text>
                            </TableHead>
                            <TableHead style={{ width: columnWidths }}>
                                <Text className="text-center font-bold text-md">{t('return-detail.state')}</Text>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <FlashList
                            data={data}
                            estimatedItemSize={5}
                            contentContainerStyle={{
                                paddingBottom: insets.bottom,
                            }}
                            extraData={scannedTrackingNumbers}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: { trackingNumber }, index }) => {
                                const alreadyScanned = scannedTrackingNumbers.has(trackingNumber)
                                return (
                                    <TableRow
                                        key={trackingNumber}
                                        className={cn('active:bg-secondary', index % 2 && 'bg-muted/40 ', alreadyScanned && 'bg-green-100')}
                                    >
                                        <TableCell style={{ width: columnWidths }}>
                                            <Text className="text-center">{trackingNumber}</Text>
                                        </TableCell>
                                        <TableCell style={{ width: columnWidths }}>
                                            <Text className="text-center">{alreadyScanned ? t('return-detail.scanned') : t('return-detail.not-scanned')}</Text>
                                        </TableCell>
                                    </TableRow>
                                )
                            }}
                            ListFooterComponent={() => {
                                return (
                                    <>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell className="justify-center">
                                                    <Text className="text-foreground">
                                                        <Text className="font-bold">{t('total')} </Text>
                                                        {data?.length}
                                                    </Text>
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                        <View className="items-center py-3 ios:pb-0">
                                            <Text nativeID="packages-table" className="items-center text-sm text-muted-foreground">
                                                {t('return-detail.packages-list')}
                                            </Text>
                                        </View>
                                    </>
                                )
                            }}
                        />
                    </TableBody>
                </Table>
            </ScrollView>
        </>
    )
}
