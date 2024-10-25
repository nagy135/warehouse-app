import { useMutation } from '@tanstack/react-query'
import { useSession } from '~/ctx'
import { API_ROOT } from '~/lib/constants'
import { EntryExitStatesEnum } from '~/lib/types'

type EntryExitMove = {
    type: 'exit' | 'entry'
    id: number
    state?: EntryExitStatesEnum
}

export default function useEntryExitMove(): {
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    mutateAsync: (args: EntryExitMove) => Promise<void>
} {
    const { session } = useSession()
    const mutateRecords = async ({ type, id, state }: EntryExitMove) => {
        const path = `${API_ROOT}/${type}/${state ?? 'moved'}`
        if (process.env.EXPO_PUBLIC_CUSTOM_DEBUG == 'true') {
            console.log(`changing: ${path}`)
        }

        const res = await fetch(path, {
            headers: {
                Authorization: `Bearer ${session?.accessToken}`,
                ContentType: 'application/json',
            },
            body: JSON.stringify({
                id,
            }),
            method: 'POST',
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
        mutateAsync: (args: EntryExitMove) => mutateAsync(args),
    }
}
