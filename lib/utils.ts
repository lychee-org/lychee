import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  // Capitalize the first letter of a string. And add spaces as word is camel case
  s = s.replace(/([A-Z])/g, ' $1');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
