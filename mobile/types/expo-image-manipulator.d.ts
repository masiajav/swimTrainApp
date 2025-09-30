declare module 'expo-image-manipulator' {
  export type SaveFormat = 'jpeg' | 'png' | 'webp';
  export interface ManipulateResult {
    uri: string;
    width: number;
    height: number;
    base64?: string | null;
  }
  export function manipulateAsync(
    uri: string,
    actions: Array<any>,
    options?: { compress?: number; format?: { toString(): string } | any; base64?: boolean }
  ): Promise<ManipulateResult>;
  export const SaveFormat: { JPEG: SaveFormat; PNG: SaveFormat; WEBP: SaveFormat };
  export {};
}
