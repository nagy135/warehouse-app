import { useMutation } from '@tanstack/react-query'
import { useSession } from '~/ctx'
import { API_ROOT } from '~/lib/constants'

type checkStorageExits = {
    sku: string
}

export default function useCheckStorageExits(): {
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    mutateAsync: (args: checkStorageExits) => Promise<{id: string, sku: string}>
} {
    const { session } = useSession()
    const mutateRecords = async ({ sku }: checkStorageExits) => {
        const path = `${API_ROOT}/storage/sku?sku=${sku}`
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
        mutationKey: [`check-storage-exits`],
        mutationFn: mutateRecords,
    })
    return {
        isPending,
        isError,
        isSuccess,
        mutateAsync: (args: checkStorageExits) => mutateAsync(args),
    }
}
