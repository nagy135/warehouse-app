import { FlashList } from '@shopify/flash-list'
import * as React from 'react'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Text } from '~/components/ui/text'
import { cn, groupBy } from '~/lib/utils'
import { ProductStorage } from '~/lib/types'
import { useMemo } from 'react'
import { router } from 'expo-router'
import { Button } from './ui/button'
import ConfirmationModal from './modal/confirmation-modal'
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state'

export const MIN_COLUMN_WIDTHS = [50, 120, 120, 140, 100]

export type GroupedProductStorage = {
    productStorage: ProductStorage
    count: number
    counted: number
    moved?: number
    notMoved?: number
    allIds: number[]
    positions?: string[]
}

export default function ProductStorageList({
    data,
    refetchProductStorages,
    variant,
}: {
    data: ProductStorage[]
    refetchProductStorages: () => void
    variant: 'entry' | 'exit'
}) {
    const { width } = useWindowDimensions()
    const insets = useSafeAreaInsets()

    const grouped = useMemo(() => groupBy(data, 'productSkuVariant.id'), [data])
    const groupedProductStorages = useMemo(() => {
        return Object.entries(grouped).map(([_, groupOfProductStorages]) => {
            const uniqueProductStorage: GroupedProductStorage = {
                productStorage: groupOfProductStorages[0],
                count: groupOfProductStorages.length,
                moved: groupOfProductStorages.filter(item => item.state === 'moved').length,
                notMoved: groupOfProductStorages.filter(item => item.state !== 'moved').length,
                counted: groupOfProductStorages.filter(item => item.state === 'counted').length,
                positions: [...new Set(groupOfProductStorages.map(item => item.storage.position?.name ?? ''))],
                allIds: groupOfProductStorages.map((ps) => ps.id),
            }
            return uniqueProductStorage
        })
    }, [grouped])

    const { mutate: mutateChangeProductStorageState } = useChangeProductStorageState({ onSuccessCallback: refetchProductStorages })

    const columnWidths = React.useMemo(() => {
        return MIN_COLUMN_WIDTHS.map((minWidth) => {
            const evenWidth = width / MIN_COLUMN_WIDTHS.length
            return evenWidth > minWidth ? evenWidth : minWidth
        })
    }, [width])

    return (
        <>
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
                <Table aria-labelledby="productstorage-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead style={{ width: columnWidths[0] }}>
                                <Text className="text-center font-bold text-md">Count</Text>
                            </TableHead>
                            <TableHead style={{ width: columnWidths[0] }}>
                                <Text className="text-center font-bold text-md">Moved</Text>
                            </TableHead>
                            {variant === "exit" && <TableHead style={{ width: columnWidths[1] }}>
                                <Text className="font-bold text-md">Position(s)</Text>
                            </TableHead>}
                            <TableHead style={{ width: columnWidths[1] }}>
                                <Text className="font-bold text-md">Variant name</Text>
                            </TableHead>
                            <TableHead className="font-bold text-lg" style={{ width: columnWidths[2] }}>
                                <Text className="font-bold text-md">Change</Text>
                            </TableHead>
                            <TableHead className="font-bold text-lg" style={{ width: columnWidths[3] }}>
                                <Text className="font-bold text-md">Delivery</Text>
                            </TableHead>
                            <TableHead className="font-bold text-lg" style={{ width: columnWidths[4] }}>
                                <Text className="font-bold text-md"></Text>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <FlashList
                            data={groupedProductStorages}
                            estimatedItemSize={5}
                            contentContainerStyle={{
                                paddingBottom: insets.bottom,
                            }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: { productStorage, ...groupRest }, index }) => {
                                return (
                                    <TableRow
                                        key={productStorage.id}
                                        className={cn('active:bg-secondary', index % 2 && 'bg-muted/40 ', groupRest.notMoved === 0 && 'bg-green-100')}
                                        onPress={() => {
                                            const group = grouped[productStorage.productSkuVariant.id]
                                            const storageIds = group.map((ps) => ps.storage.id)
                                            if (variant === 'exit') {
                                                router.push({
                                                    /* @ts-ignore */
                                                    pathname: '/logged-in/storages-group',
                                                    params: { storageIds },
                                                })
                                            }
                                        }}
                                    >
                                        <TableCell style={{ width: columnWidths[0] }} className="items-center">
                                            <Text>
                                                {groupRest.notMoved === 0 ? '' : `${groupRest.counted}/${groupRest.notMoved}`}
                                            </Text>
                                        </TableCell>
                                        <TableCell style={{ width: columnWidths[0] }} className="items-center">
                                            <Text>
                                                {groupRest.moved}/{groupRest.count}
                                            </Text>
                                        </TableCell>
                                        {variant === "exit" && <TableCell style={{ width: columnWidths[1] }}>
                                            <Text>{groupRest.positions?.map((position, index) => `${index === 0 ? '' : ', '}${position}`)}</Text>
                                        </TableCell>}
                                        <TableCell className="items-end" style={{ width: columnWidths[1] }}>
                                            <Text>{productStorage.productSkuVariant.name}</Text>
                                        </TableCell>
                                        <TableCell style={{ width: columnWidths[2] }}>
                                            <Text>{productStorage.productSkuVariant.productCV.name}</Text>
                                        </TableCell>
                                        <TableCell style={{ width: columnWidths[3] }}>
                                            <Text>{productStorage.productSkuVariant.productDV.name}</Text>
                                        </TableCell>

                                        <TableCell style={{ width: columnWidths[4] }} className="items-end ">
                                            <ConfirmationModal
                                                button={
                                                    <Button variant="destructive" size="sm" className="shadow-sm shadow-foreground/10 mr-3">
                                                        <Text>reset</Text>
                                                    </Button>
                                                }
                                                title="Reset"
                                                description="Are you sure you want to reset counting on this product storage?"
                                                onConfirm={() => {
                                                    mutateChangeProductStorageState({
                                                        ids: groupRest.allIds,
                                                        change: 'none',
                                                    })
                                                }}
                                            />
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
                                                        <Text className="font-bold">Total:</Text>{' '}
                                                        {`${groupedProductStorages.reduce((prev, next) => prev + next.count, 0)}`}
                                                    </Text>
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                        <View className="items-center py-3 ios:pb-0">
                                            <Text nativeID="invoice-table" className="items-center text-sm text-muted-foreground">
                                                A list of product storages in this {variant}
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
