import { z } from "zod";

/**
 * ファイルスキーマ
 */
export const FileSchema = z.object({
  id: z.number().int().positive(),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().int().positive(),
  objectKey: z.string().min(1),
  folder: z.string().nullable(),
  uploadedAt: z.date(),
  updatedAt: z.date(),
});

export type File = z.infer<typeof FileSchema>;

/**
 * ファイルアップロードスキーマ
 */
export const UploadFileSchema = z.object({
  file: z.instanceof(Buffer),
  originalName: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().int().positive(),
  folder: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof UploadFileSchema>;

/**
 * ファイル一覧クエリスキーマ
 */
export const FileListQuerySchema = z.object({
  folder: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type FileListQuery = z.infer<typeof FileListQuerySchema>;

/**
 * ファイルレスポンススキーマ
 */
export const FileResponseSchema = z.object({
  id: z.number().int().positive(),
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number().int().positive(),
  folder: z.string().nullable(),
  uploadedAt: z.string(),
  updatedAt: z.string(),
});

export type FileResponse = z.infer<typeof FileResponseSchema>;

/**
 * ファイル一覧レスポンススキーマ
 */
export const FileListResponseSchema = z.object({
  files: z.array(FileResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type FileListResponse = z.infer<typeof FileListResponseSchema>;

/**
 * FileMetadata型（リポジトリ層で使用）
 */
export type FileMetadata = {
  originalName: string;
  mimetype: string;
  size: number;
  folder?: string;
};

/**
 * 許可されるMIMEタイプ
 */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/json",
  "text/plain",
  "text/csv",
] as const;

/**
 * デフォルトファイルサイズ制限（10MB）
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
