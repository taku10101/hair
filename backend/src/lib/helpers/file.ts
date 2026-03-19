import type { File, FileResponse } from "@/schemas/storageSchema";

/**
 * ファイル関連のヘルパー関数
 */

/**
 * Prismaから取得したファイルデータの型
 */
export type PrismaFile = {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  objectKey: string;
  folder: string | null;
  uploadedAt: Date;
  updatedAt: Date;
};

/**
 * PrismaのFileモデルからFile型に変換
 * @param prismaFile Prismaから取得したファイルデータ
 * @returns File型
 */
export const fromPrisma = (prismaFile: PrismaFile): File => {
  return {
    id: prismaFile.id,
    filename: prismaFile.filename,
    originalName: prismaFile.originalName,
    mimetype: prismaFile.mimetype,
    size: prismaFile.size,
    objectKey: prismaFile.objectKey,
    folder: prismaFile.folder,
    uploadedAt: prismaFile.uploadedAt,
    updatedAt: prismaFile.updatedAt,
  };
};

/**
 * ファイルをJSON形式に変換
 * @param file ファイルデータ
 * @returns FileResponse型
 */
export const toJSON = (file: File): FileResponse => {
  return {
    id: file.id,
    filename: file.filename,
    originalName: file.originalName,
    mimetype: file.mimetype,
    size: file.size,
    folder: file.folder,
    uploadedAt: file.uploadedAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
};

/**
 * MIMEタイプが有効かチェック
 * @param file ファイルデータ
 * @param allowedTypes 許可されたMIMEタイプの配列
 * @returns 有効な場合true
 */
export const isValidMimetype = (file: File, allowedTypes: readonly string[]): boolean => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * ファイル拡張子を取得
 * @param file ファイルデータ
 * @returns ファイル拡張子
 */
export const getFileExtension = (file: File): string => {
  const parts = file.filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
};

/**
 * ファイルサイズを人間が読みやすい形式で取得
 * @param file ファイルデータ
 * @returns 人間が読みやすいサイズ表記
 */
export const getHumanReadableSize = (file: File): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = file.size;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};
