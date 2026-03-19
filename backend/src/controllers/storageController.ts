import type { Context } from "hono";
import { stream } from "hono/streaming";
import { ValidationError } from "@/lib/errors";
import { toJSON } from "@/lib/helpers/file";
import type { StorageService } from "@/services/storageService";

/**
 * StorageControllerの作成
 * HTTPリクエストを処理し、StorageServiceを呼び出す
 */
export const createStorageController = (storageService: StorageService) => {
  return {
    /**
     * ファイルをアップロード
     * POST /api/storage/upload
     */
    async upload(c: Context) {
      const body = await c.req.parseBody();
      const file = body.file;

      if (!file || !(file instanceof File)) {
        throw new ValidationError("ファイルが指定されていません");
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadedFile = await storageService.uploadFile(
        buffer,
        file.name,
        file.type,
        file.size,
        body.folder as string | undefined
      );

      return c.json(toJSON(uploadedFile), 201);
    },

    /**
     * ファイルをダウンロード
     * GET /api/storage/download/:id
     */
    async download(c: Context) {
      const id = Number.parseInt(c.req.param("id"), 10);

      if (Number.isNaN(id)) {
        throw new ValidationError("無効なファイルIDです");
      }

      const { stream: fileStream, file } = await storageService.downloadFile(id);

      c.header("Content-Type", file.mimetype);
      c.header(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      c.header("Content-Length", file.size.toString());

      return stream(c, async (streamWriter) => {
        const reader = fileStream;
        reader.on("data", (chunk: Buffer) => {
          streamWriter.write(chunk);
        });
        reader.on("end", () => {
          streamWriter.close();
        });
        reader.on("error", () => {
          streamWriter.close();
        });
      });
    },

    /**
     * ファイル情報を取得
     * GET /api/storage/files/:id
     */
    async getFileInfo(c: Context) {
      const id = Number.parseInt(c.req.param("id"), 10);

      if (Number.isNaN(id)) {
        throw new ValidationError("無効なファイルIDです");
      }

      const file = await storageService.getFileMetadata(id);

      return c.json(toJSON(file), 200);
    },

    /**
     * ファイル一覧を取得
     * GET /api/storage/files
     */
    async listFiles(c: Context) {
      const folder = c.req.query("folder");
      const page = Number.parseInt(c.req.query("page") || "1", 10);
      const limit = Number.parseInt(c.req.query("limit") || "20", 10);

      const { files, total, totalPages } = await storageService.listFiles(folder, page, limit);

      return c.json(
        {
          files: files.map((file) => toJSON(file)),
          total,
          page,
          limit,
          totalPages,
        },
        200
      );
    },

    /**
     * ファイルを削除
     * DELETE /api/storage/files/:id
     */
    async deleteFile(c: Context) {
      const id = Number.parseInt(c.req.param("id"), 10);

      if (Number.isNaN(id)) {
        throw new ValidationError("無効なファイルIDです");
      }

      await storageService.deleteFile(id);

      return c.json({ message: "ファイルを削除しました" }, 200);
    },
  };
};

/**
 * StorageControllerの型定義
 */
export type StorageController = ReturnType<typeof createStorageController>;
