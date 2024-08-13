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
};


// cast every value to string or string[] that isnt that already
// this is needed because expo router stringifies every value
export type ToStringOrStringArray<T> = {
	[K in keyof T]: T[K] extends string | string[] ? T[K] : string;
};
