import { useMutation } from '@tanstack/react-query'
import { useSession } from '~/ctx'
import { API_ROOT } from '~/lib/constants'
import { PositionExits } from '~/lib/types'

type checkPositionExits = {
    sku: string
}

export default function useCheckPositionExits(): {
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    mutateAsync: (args: checkPositionExits) => Promise<PositionExits>
} {
    const { session } = useSession()
    const mutateRecords = async ({ sku }: checkPositionExits) => {
        const path = `${API_ROOT}/position/sku?sku=${sku}`
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
        mutationKey: [`check-position-exits`],
        mutationFn: mutateRecords,
    })
    return {
        isPending,
        isError,
        isSuccess,
        mutateAsync: (args: checkPositionExits) => mutateAsync(args),
    }
}
