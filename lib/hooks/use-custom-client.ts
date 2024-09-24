import { useContext } from 'react'
import { useSession } from '~/ctx'
import { API_ROOT } from '../constants'

export type BodyType<BodyData> = BodyData & { headers?: object }

export type ErrorType<ErrorData> = ErrorData

export type CustomClient<T> = (data: {
    url: string
    method: 'get' | 'post' | 'put' | 'delete' | 'patch'
    params?: Record<string, string>
    headers?: Record<string, string>
    data?: BodyType<unknown>
    signal?: AbortSignal
    responseType?: 'blob' | 'text'
}) => Promise<T>

export const useCustomClient = <T>(): CustomClient<T> => {
    const { session } = useSession()

    return async ({ url, method, params: searchParams, data, headers, responseType }) => {
        const allParams = {
            ...searchParams,
        }

        const params = `?${new URLSearchParams(allParams)}`
        const customHeaders: Record<string, string> = {
            ...headers,
            ...data?.headers,
        }
        if (session?.accessToken) {
            customHeaders['Authorization'] = `Bearer ${session?.accessToken}`
        }

        const response = await fetch(`${API_ROOT}/${url}${params}`, {
            method,
            headers: customHeaders,
            ...(data ? { body: JSON.stringify(data) } : {}),
        })

        const responseBody = response.json()

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return responseBody
    }
}
