import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CountModal from '~/components/modal/count-modal'
import { GroupedProductStorage } from '~/components/product-storage-list'
import Scanner from '~/components/scanner'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Text } from '~/components/ui/text'
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state'
import useCheckStorageExits from '~/lib/hooks/api/use-check-storage-exits'
import useRecordDetail from '~/lib/hooks/api/use-record-detail'
import useNotificationModal from '~/lib/hooks/use-notification-modal'
import { Exit, ProductSkuVariant, ToStringOrStringArray } from '~/lib/types'
import { cn, groupBy } from '~/lib/utils'
import useEntryExitMove from '~/lib/hooks/api/use-entry-exit-move'

export default function DetailPageSecondPage() {
    const insets = useSafeAreaInsets()
    const exit = useLocalSearchParams<ToStringOrStringArray<{ id: string }>>()
    const exitId = Number(exit.id)

    const { data, isLoading, isRefetching, refetch: refetchExits } = useRecordDetail<Exit>(exitId, 'exit')

    const [selectedProductSkuVariant, setSelectedProductSkuVariant] = useState<ProductSkuVariant>()
    const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits()
    const { mutateAsync: mutateExitMove } = useEntryExitMove()
    const [countModalOpen, setCountModalOpen] = useState(false)
    const { mutate: mutateChangeProductStorageState } = useChangeProductStorageState({ onSuccessCallback: refetchExits })

    const { modal: countWarningModal, setOpen: openCountWarningModal } = useNotificationModal({
        variant: 'danger',
        title: 'Not enough items scanned with given SKU',
        description: 'Please try again, in table there is line with how many items are there',
    })

    const { modal: skuNotFoundModal, setOpen: openSkuNotFoundModal } = useNotificationModal({
        variant: 'danger',
        title: 'Storage nebol nájdeny',
        description: 'Naskenovaný SKU kód nepríslucha žiadnemu storage',
    })

    const { modal: exitDoneModal, setOpen: openExitDoneModal } = useNotificationModal({
        variant: 'default',
        title: 'Exit has been processed',
        description: 'Whole exit has been processed',
        onClose: () => {
            router.push({
                pathname: '/logged-in/',
            })
        },
    })

    const { modal: exitErrorModal, setOpen: openExitErrorModal } = useNotificationModal({
        variant: 'danger',
        title: 'Exit has not been processed',
        description: 'Error occurred',
    })

    const grouped = useMemo(() => (data?.productStorages ? groupBy(data?.productStorages, 'productSkuVariant.id') : {}), [data])
    const groupedProductStorages = useMemo(() => {
        return Object.entries(grouped).map(([_, groupOfProductStorages]) => {
            const uniqueProductStorage: GroupedProductStorage = {
                productStorage: groupOfProductStorages[0], // lets show just first one
                count: groupOfProductStorages.filter((storage) => storage.state).length,
                notMoved: groupOfProductStorages.filter(item => item.state !== 'moved' ).length,
                counted: groupOfProductStorages.filter((storage) => storage.state === 'counted').length,
                allIds: groupOfProductStorages.map((ps) => ps.id),
            }
            return uniqueProductStorage
        })
    }, [grouped])

    if (isLoading || isRefetching)
        return (
            <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                <ActivityIndicator size={60} color="#666666" />
            </View>
        )

    const atLeasOneProductMoved = data?.productStorages?.find((storage) => storage.state === 'moved')

    return (
        <View className="h-full px-2 container">
            <View className="m-2 flex flex-row gap-3">
                {selectedProductSkuVariant ? (
                    <View className="flex-1">
                        <Scanner
                            label="Skenovanie boxu"
                            variant="secondary"
                            mockData="newfancybox123"
                            onScan={async (storageCode) => {
                                mutateCheckStorageExits({ sku: storageCode })
                                    .then(() => setCountModalOpen(true))
                                    .catch(openSkuNotFoundModal)
                            }}
                        />
                    </View>
                ) : (
                    <View className="flex-1">
                        <Text className="text-xl text-center font-bold">Vyberte produkt pre skenovanie pozicie</Text>
                    </View>
                )}
            </View>
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <Table aria-labelledby="productstorage-table" className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/3">
                                <Text className="text-center font-bold text-md">Count</Text>
                            </TableHead>
                            <TableHead className="w-2/3">
                                <Text className="font-bold text-md">Variant name</Text>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <FlashList
                            data={groupedProductStorages.filter(item => item.notMoved !== 0)}
                            estimatedItemSize={5}
                            contentContainerStyle={{
                                paddingBottom: insets.bottom,
                            }}
                            extraData={selectedProductSkuVariant}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: { productStorage, ...groupRest }, index }) => {
                                return (
                                    <TableRow
                                        key={productStorage.id}
                                        className={cn(
                                            'w-full',
                                            index % 2 && 'bg-muted/40',
                                            selectedProductSkuVariant?.id == productStorage.productSkuVariant.id && 'bg-blue-100',
                                        )}
                                        onPress={() => setSelectedProductSkuVariant(productStorage.productSkuVariant)}
                                    >
                                        <TableCell className="w-1/3 items-center">
                                            <Text>
                                                {groupRest.counted}/{groupRest.notMoved}
                                            </Text>
                                        </TableCell>
                                        <TableCell className="w-2/3">
                                            <Text>{productStorage.productSkuVariant.name}</Text>
                                        </TableCell>
                                    </TableRow>
                                )
                            }}
                        />
                    </TableBody>
                </Table>
            </ScrollView>
            <CountModal
                open={countModalOpen}
                setClose={() => {
                    setCountModalOpen(false)
                }}
                productName={selectedProductSkuVariant?.name}
                onConfirm={(count) => {
                    const productStoragesWithThisSkuVariantIds =
                        data?.productStorages
                            ?.filter(
                                (productStorage) =>
                                    productStorage.productSkuVariant.sku === selectedProductSkuVariant?.sku && productStorage.state === 'counted',
                            )
                            .map((item) => item.id) ?? []
                    if (productStoragesWithThisSkuVariantIds.length < count) {
                        openCountWarningModal()
                        return
                    }
                    setSelectedProductSkuVariant(undefined)
                    mutateChangeProductStorageState({
                        ids: productStoragesWithThisSkuVariantIds.slice(0, count),
                        change: 'moved',
                    })
                    setCountModalOpen(false)
                }}
            />
            {countWarningModal}
            {skuNotFoundModal}
            {exitDoneModal}
            {exitErrorModal}
            {atLeasOneProductMoved && (
                <View className="absolute bottom-10 left-0 right-0 p-4">
                    <Button
                        className="w-full"
                        onPress={() => {
                            if (data?.productStorages?.every((storage) => storage.state === 'moved')) {
                                mutateExitMove({ type: 'exit', id: exitId }).then(openExitDoneModal).catch(openExitErrorModal)
                            } else {
                                router.push({
                                    pathname: '/logged-in/',
                                })
                            }
                        }}
                    >
                        <Text className="text-center">Finish</Text>
                    </Button>
                </View>
            )}
        </View>
    )
}
