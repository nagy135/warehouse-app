import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GroupByResult } from "./types";

// NOTE: for testing slower fetches
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T>(array: T[], key: string): GroupByResult<T> {
  return array.reduce((result: GroupByResult<T>, item: T) => {
    // Split the key by dots to handle nested properties
    const keys = key.split(".");
    // Use reduce to traverse through the nested properties
    const value = keys.reduce(
      (obj: any, key: string) => (obj ? obj[key] : undefined),
      item
    );

    if (value !== undefined) {
      if (!result[value]) {
        result[value] = [];
      }
      result[value].push(item);
    }

    return result;
  }, {});
}

export function arrayCount<T>(array: T[], value: T): number {
  return array.filter((v) => v === value).length;
}
