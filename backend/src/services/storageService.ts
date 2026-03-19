import type { Readable } from "node:stream";
import type { StorageRepository } from "@/repositories/storageRepository";
import type { File } from "@/schemas/storageSchema";
import { ALLOWED_MIME_TYPES, DEFAULT_MAX_FILE_SIZE } from "@/schemas/storageSchema";

/**
 * StorageServiceの作成
 * ファイル操作のビジネスロジックを提供
 */
export const createStorageService = (storageRepository: StorageRepository) => {
  /**
   * MIMEタイプのバリデーション
   */
  const validateMimetype = (mimetype: string): void => {
    if (!ALLOWED_MIME_TYPES.includes(mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new Error(
        `許可されていないファイルタイプです: ${mimetype}。許可されているタイプ: ${ALLOWED_MIME_TYPES.join(", ")}`
      );
    }
  };

  /**
   * ファイルサイズのバリデーション
   */
  const validateFileSize = (size: number, maxSize = DEFAULT_MAX_FILE_SIZE): void => {
    if (size <= 0) {
      throw new Error("ファイルサイズが0以下です");
    }

    if (size > maxSize) {
      throw new Error(
        `ファイルサイズが上限を超えています: ${size}バイト（上限: ${maxSize}バイト）`
      );
    }
  };

  /**
   * ファイル名のサニタイゼーション
   */
  const sanitizeOriginalName = (originalName: string): string => {
    if (!originalName || originalName.trim() === "") {
      throw new Error("ファイル名が空です");
    }

    // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を除外するため意図的に使用
    const sanitized = originalName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

    if (sanitized.includes("..")) {
      throw new Error("不正なファイル名です（パストラバーサル対策）");
    }

    return sanitized.substring(0, 255);
  };

  /**
   * ページネーションのlimitバリデーション
   */
  const validateLimit = (limit: number): number => {
    if (limit <= 0) {
      return 20;
    }

    if (limit > 100) {
      return 100;
    }

    return limit;
  };

  return {
    /**
     * ファイルをアップロード
     */
    async uploadFile(
      file: Buffer | Readable,
      originalName: string,
      mimetype: string,
      size: number,
      folder?: string
    ): Promise<File> {
      validateMimetype(mimetype);

      validateFileSize(size);

      const sanitizedOriginalName = sanitizeOriginalName(originalName);

      return await storageRepository.uploadFile(file, {
        originalName: sanitizedOriginalName,
        mimetype,
        size,
        folder,
      });
    },

    /**
     * ファイルをダウンロード
     */
    async downloadFile(id: number): Promise<{ stream: Readable; file: File }> {
      const file = await storageRepository.getFileMetadata(id);

      if (!file) {
        throw new Error("ファイルが見つかりません");
      }

      const stream = await storageRepository.downloadFile(file.objectKey);

      return { stream, file };
    },

    /**
     * ファイルを削除
     */
    async deleteFile(id: number): Promise<void> {
      const file = await storageRepository.getFileMetadata(id);

      if (!file) {
        throw new Error("ファイルが見つかりません");
      }

      await storageRepository.deleteFile(file.objectKey);
    },

    /**
     * ファイル一覧を取得
     */
    async listFiles(
      folder?: string,
      page = 1,
      limit = 20
    ): Promise<{ files: File[]; total: number; totalPages: number }> {
      const validatedLimit = validateLimit(limit);

      const { files, total } = await storageRepository.listFiles(folder, page, validatedLimit);

      const totalPages = Math.ceil(total / validatedLimit);

      return { files, total, totalPages };
    },

    /**
     * ファイルメタデータを取得
     */
    async getFileMetadata(id: number): Promise<File> {
      const file = await storageRepository.getFileMetadata(id);

      if (!file) {
        throw new Error("ファイルが見つかりません");
      }

      return file;
    },
  };
};

/**
 * StorageServiceの型定義
 */
export type StorageService = ReturnType<typeof createStorageService>;
