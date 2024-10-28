import { useMutation } from '@tanstack/react-query'
import { useSession } from '~/ctx'
import { API_ROOT } from '~/lib/constants'
import { Product } from '~/lib/types'

type checkProductExits = {
    sku: string
}

export default function useCheckProductExits(): {
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    mutateAsync: (args: checkProductExits) => Promise<Product>
} {
    const { session } = useSession()
    const mutateRecords = async ({ sku }: checkProductExits) => {
        const path = `${API_ROOT}/product-sku-variant/sku?sku=${sku}`
        if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
            console.log(`changing: ${path}`)
        }

        const res = await fetch(path, {
            headers: {
                Authorization: `Bearer ${session?.accessToken}`,
                ContentType: 'application/json',
            },
            method: 'GET',
        })
        const data = await res.json()
        return data
    }

    const { isPending, isError, isSuccess, mutateAsync } = useMutation({
        mutationKey: [`check-product-exits`],
        mutationFn: mutateRecords,
    })
    return {
        isPending,
        isError,
        isSuccess,
        mutateAsync: (args: checkProductExits) => mutateAsync(args),
    }
}
