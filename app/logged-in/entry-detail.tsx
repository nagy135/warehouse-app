import { router, useLocalSearchParams } from 'expo-router'
import { MoveRight } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import CountModal from '~/components/modal/count-modal'
import ProductStorageList from '~/components/product-storage-list'
import Scanner from '~/components/scanner'
import { Button } from '~/components/ui/button'
import useChangeProductStorageState from '~/lib/hooks/api/use-change-product-storage-state'
import useRecordDetail from '~/lib/hooks/api/use-record-detail'
import useNotificationModal from '~/lib/hooks/use-notification-modal'
import { Entry, ProductSkuVariant, type ToStringOrStringArray } from '~/lib/types'
import { cn } from '~/lib/utils'

export default function DetailPage() {
    const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>()
    const entryId = Number(entry.id)

    const { data, isLoading, isRefetching, refetch: refetchEntries } = useRecordDetail<Entry>(entryId, 'entry')
    const { mutate: mutateChangeProductStorageState } = useChangeProductStorageState({ onSuccessCallback: refetchEntries })
    const { modal: countWarningModal, setOpen: openCountWarningModal } = useNotificationModal({
        variant: 'danger',
        title: 'Not enough items in this entry with given SKU',
        description: 'Please try again, in table there is line with how many items are there',
    })

    const { modal: skuNotFoundModal, setOpen: openSkuNotFoundModal } = useNotificationModal({
        variant: 'danger',
        title: 'Produkt nebol nájdeny',
        description: 'Naskenovaný SKU kód nepríslucha žiadnemu produktu',
    })
    const { modal: notFinishedWarningModal, setOpen: openNotFinishedWarningModal } = useNotificationModal({
        variant: 'danger',
        title: 'This Entry is not finished yet',
        description: 'Please scan all the products in this entry before transferring',
    })

    const [selectedProductSkuVariant, setSelectedProductSkuVariant] = useState<ProductSkuVariant>()

    const [countModalOpen, setCountModalOpen] = useState(false)
    if (isLoading || isRefetching)
        return (
            <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                <ActivityIndicator size={60} color="#666666" />
            </View>
        )
    const atLeasOneProductScanned = data?.productStorages?.find((storage) => storage.state === 'counted')

    return (
        <View className="h-full px-2 container">
            <View className="m-2 flex flex-row gap-3">
                <View className={cn(atLeasOneProductScanned ? 'flex-auto' : 'flex-1')}>
                    <Scanner
                        label="Skenovanie produktov"
                        variant="secondary"
                        // mockData="4058172286521"
                        mockData="sweetwaffles50123"
                        onScan={(skuCode) => {
                            const productStoragesWithScannedSku = data?.productStorages?.find((storage) => storage.productSkuVariant.sku === skuCode)
                            if (productStoragesWithScannedSku) {
                                setSelectedProductSkuVariant(productStoragesWithScannedSku.productSkuVariant)
                                setCountModalOpen(true)
                            } else {
                                openSkuNotFoundModal()
                            }
                        }}
                    />
                </View>
                {atLeasOneProductScanned && (
                    <View className="flex-1">
                        <Button
                            className="my-auto"
                            onPress={() => {
                                router.push({
                                    pathname: '/logged-in/entry-detail-second-step',
                                    params: { id: entry.id },
                                })
                            }}
                        >
                            <MoveRight color="white" />
                        </Button>
                    </View>
                )}
            </View>
            {data?.productStorages && <ProductStorageList variant="entry" data={data.productStorages} refetchProductStorages={refetchEntries} />}
            <CountModal
                open={countModalOpen}
                setClose={() => {
                    setSelectedProductSkuVariant(undefined)
                    setCountModalOpen(false)
                }}
                productName={selectedProductSkuVariant?.name}
                onConfirm={(count) => {
                    const productStoragesWithThisSkuVariantIds =
                        data?.productStorages
                            ?.filter(
                                (productStorage) =>
                                    productStorage.productSkuVariant.sku === selectedProductSkuVariant?.sku && productStorage.state === 'none',
                            )
                            .map((item) => item.id) ?? []
                    if (productStoragesWithThisSkuVariantIds.length < count) {
                        openCountWarningModal()
                        return
                    }
                    setSelectedProductSkuVariant(undefined)
                    let ids = productStoragesWithThisSkuVariantIds.slice(0, count)
                    if (process.env.EXPO_PUBLIC_MOCK_SCANNER === 'true') {
                        //for testing purpose each product is scanned with count 1
                        const tmpIds = new Set<number>()
                        ids = []
                        data?.productStorages?.forEach((storage) => {
                            if (!tmpIds.has(storage.productSkuVariantId)) {
                                ids.push(storage.id)
                            }
                            tmpIds.add(storage.productSkuVariantId)
                        })
                    }
                    mutateChangeProductStorageState({
                        ids: ids,
                        change: 'counted',
                    })
                    setCountModalOpen(false)
                }}
            />
            {skuNotFoundModal}
            {countWarningModal}
            {notFinishedWarningModal}
        </View>
    )
}
