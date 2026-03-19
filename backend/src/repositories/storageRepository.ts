import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import type { PrismaClient } from "@prisma/client";
import type { Client as MinIOClient } from "minio";
import { env } from "@/lib/env";
import { fromPrisma } from "@/lib/helpers/file";
import type { File, FileMetadata } from "@/schemas/storageSchema";

/**
 * StorageRepositoryの作成
 * MinIOとPrismaを使用したファイル管理
 */
export const createStorageRepository = (prisma: PrismaClient, minioClient: MinIOClient) => {
  /**
   * ユニークなオブジェクトキーを生成
   */
  const generateObjectKey = (originalName: string, folder?: string): string => {
    const uuid = randomUUID();
    const sanitizedName = sanitizeFilename(originalName);
    const key = `${uuid}-${sanitizedName}`;

    return folder ? `${folder}/${key}` : key;
  };

  /**
   * ファイル名をサニタイズ（パストラバーサル対策）
   */
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .substring(0, 255);
  };

  /**
   * オブジェクトキーからファイル名を抽出
   */
  const extractFilename = (objectKey: string): string => {
    const parts = objectKey.split("/");
    return parts[parts.length - 1];
  };

  return {
    /**
     * ファイルをアップロード
     */
    async uploadFile(file: Buffer | Readable, metadata: FileMetadata): Promise<File> {
      const objectKey = generateObjectKey(metadata.originalName, metadata.folder);

      try {
        if (Buffer.isBuffer(file)) {
          await minioClient.putObject(env.MINIO_BUCKET_NAME, objectKey, file, metadata.size, {
            "Content-Type": metadata.mimetype,
          });
        } else {
          await minioClient.putObject(env.MINIO_BUCKET_NAME, objectKey, file, metadata.size, {
            "Content-Type": metadata.mimetype,
          });
        }

        const savedFile = await prisma.file.create({
          data: {
            filename: extractFilename(objectKey),
            originalName: metadata.originalName,
            mimetype: metadata.mimetype,
            size: metadata.size,
            objectKey,
            folder: metadata.folder || null,
          },
        });

        return fromPrisma(savedFile);
      } catch (error) {
        try {
          await minioClient.removeObject(env.MINIO_BUCKET_NAME, objectKey);
        } catch {
          // ロールバック失敗は無視（MinIOにファイルが残る可能性あり）
        }

        throw new Error(
          `ファイルのアップロードに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`
        );
      }
    },

    /**
     * ファイルをダウンロード
     */
    async downloadFile(objectKey: string): Promise<Readable> {
      try {
        const stream = await minioClient.getObject(env.MINIO_BUCKET_NAME, objectKey);
        return stream;
      } catch (error) {
        throw new Error(
          `ファイルのダウンロードに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`
        );
      }
    },

    /**
     * ファイルを削除
     */
    async deleteFile(objectKey: string): Promise<void> {
      try {
        await minioClient.removeObject(env.MINIO_BUCKET_NAME, objectKey);

        await prisma.file.delete({
          where: { objectKey },
        });
      } catch (error) {
        throw new Error(
          `ファイルの削除に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`
        );
      }
    },

    /**
     * ファイル一覧を取得
     */
    async listFiles(
      folder?: string,
      page = 1,
      limit = 20
    ): Promise<{ files: File[]; total: number }> {
      const skip = (page - 1) * limit;

      const where = folder ? { folder } : {};

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: limit,
          orderBy: { uploadedAt: "desc" },
        }),
        prisma.file.count({ where }),
      ]);

      return {
        files: files.map((file) => fromPrisma(file)),
        total,
      };
    },

    /**
     * ファイルメタデータを取得
     */
    async getFileMetadata(id: number): Promise<File | null> {
      const file = await prisma.file.findUnique({
        where: { id },
      });

      return file ? fromPrisma(file) : null;
    },

    /**
     * オブジェクトキーでファイルメタデータを取得
     */
    async getFileMetadataByObjectKey(objectKey: string): Promise<File | null> {
      const file = await prisma.file.findUnique({
        where: { objectKey },
      });

      return file ? fromPrisma(file) : null;
    },
  };
};

export type StorageRepository = ReturnType<typeof createStorageRepository>;
