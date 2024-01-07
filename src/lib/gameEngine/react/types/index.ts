export type WithOnPrefix<T extends Record<string, any>> = {
  [key in keyof T as `on${Capitalize<string & key>}`]: T[key];
};
