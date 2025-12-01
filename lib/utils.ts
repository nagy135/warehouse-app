import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GroupByResult } from './types';
import { jwtDecode } from 'jwt-decode';
import { DateTime } from 'luxon';

// NOTE: for testing slower fetches
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T>(array: T[], key: string): GroupByResult<T> {
  return array.reduce((result: GroupByResult<T>, item: T) => {
    // Split the key by dots to handle nested properties
    const keys = key.split('.');
    // Use reduce to traverse through the nested properties
    const value = keys.reduce(
      (obj: any, key: string) => (obj ? obj[key] : undefined),
      item,
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

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    // Token is expired if it expires in less than 1 hour (3600 seconds)
    return payload.exp < currentTime + 3600;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true; // Consider invalid tokens as expired
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const payload = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return false;
  }
};

export const formattedDate = (
  date?: Date | null,
  format = 'dd.MM.yyyy',
) => {
  if (!date) return '-';
  return DateTime.fromJSDate(date).toFormat(format);
};
