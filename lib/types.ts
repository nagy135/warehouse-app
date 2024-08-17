export type Entry = {
	id: number;
	name: string;
	sku: string;
	createdAt: string;
	createdById: string;
};

export type Exit = {
	id: number;
	name: string;
	sku: string;
	createdAt: string;
	createdById: string;
	productStorages?: ProductStorage[]
};

export type ProductStorage = {
	productSkuVariant: ProductSkuVariant;
	storage: Storage;
};

export type ProductSkuVariant = {
	id: number;
	name: string;
	sku: string;
	productChangeVariant: ProductChangeVariant;
	productDeliveryVariant: ProductDeliveryVariant;
};

export type ProductChangeVariant = {
	change: string;
	value: string;
	product?: Product;
};

export type ProductDeliveryVariant = {
	height: number;
	width: number;
	depth: number;
	weight: number;
	product?: Product;
};

export type Product = {
	id: number;
	name: string;
	sku: string;
	createdAt: string;
	createdById: string;
};



// cast every value to string or string[] that isnt that already
// this is needed because expo router stringifies every value
export type ToStringOrStringArray<T> = {
	[K in keyof T]: T[K] extends string | string[] ? T[K] : string;
};
