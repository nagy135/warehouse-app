import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnvVar(envKey: string): string {
  const envValue = process.env[`EXPO_PUBLIC_${envKey}`];
  if (envValue === undefined)
    throw new Error(`Environment variable ${envKey} is not defined`);
  return envValue;
}

export function isEnvVar(envKey: string, value: string | boolean): boolean {
  const envValue = process.env[`EXPO_PUBLIC_${envKey}`];
  if (envValue === undefined) return false;

  // NOTE: first compare boolean strings, otherwise compare value itself
  if (envValue === "true" && value === true) return true;
  else if (envValue === "false" && value === false) return true;
  else if (envValue === value) return true;

  return false;
}

type GroupByResult<T> = {
  [key: string]: T[];
};

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
