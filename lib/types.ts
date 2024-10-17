export type GroupByResult<T> = {
    [key: string]: T[]
}

export type Entry = {
    id: number
    name: string
    sku: string
    processed: boolean
    createdAt: string
    createdById: string
    productStorages?: ProductStorage[]
    state: EntryExitStatesEnum
}

export type Exit = {
    id: number
    name: string
    sku: string
    processed: boolean
    createdAt: string
    createdById: string
    productStorages?: ProductStorage[]
    state: EntryExitStatesEnum
}

export type Storage = {
    id: number
    name: string
    type: string
    sku: string
    position?: Position
}

export type Position = {
    id: number
    name: string
    sku: string
}

export type ProductStorage = {
    id: number
    productSkuVariant: ProductSkuVariant
    productSkuVariantId: number
    storage: Storage
    state: 'counted' | 'moved' | 'none'
}

export type ProductSkuVariant = {
    id: number
    name: string
    sku: string
    productCV: ProductCV
    productDV: ProductDV
}

export type ProductCV = {
    name: string
    change: string
    value: string
    product?: Product
}

export type ProductDV = {
    name: string
    height: number
    width: number
    depth: number
    weight: number
    product?: Product
}

export type Product = {
    id: number
    name: string
    sku: string
    createdAt: string
    createdById: string
}

// cast every value to string or string[] that isnt that already
// this is needed because expo router stringifies every value
export type ToStringOrStringArray<T> = {
    [K in keyof T]: T[K] extends string | string[] ? T[K] : string
}

export enum EntryExitStatesEnum {
  CREATED = 'created',
  REGISTERED = 'registered',
  MOVED = 'moved',
  CANCELED = 'canceled',
}

export enum ExitProductStepEnum {
  SCAN_LOCATION = 'SCAN_LOCATION',
  SCAN_PRODUCT = 'SCAN_PRODUCT',
  SET_COUNT = 'SET_COUNT',
  SCAN_STORAGE = 'SCAN_STORAGE',
}