export const DEGREES_TO_RADIANS = Math.PI / 180;
export const RADIANS_TO_DEGREES = 180 / Math.PI;
export const TWO_PI = Math.PI * 2;

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

// https://stackoverflow.com/questions/14879691/get-number-of-digits-with-javascript
export const countDigits = (num: number): number => {
  return (Math.log10((num ^ (num >> 31)) - (num >> 31)) | 0) + 1;
};
