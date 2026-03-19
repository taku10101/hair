import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { StorageController } from "@/controllers/storageController";
import { FileListResponseSchema, FileResponseSchema } from "@/schemas/storageSchema";

// エラースキーマ
const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  }),
});

// ファイルアップロードルート定義
const uploadFileRoute = createRoute({
  method: "post",
  path: "/upload",
  tags: ["Storage"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.instanceof(File).openapi({ type: "string", format: "binary" }),
            folder: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: FileResponseSchema,
        },
      },
      description: "File uploaded successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request or file type not allowed",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// ファイルダウンロードルート定義
const downloadFileRoute = createRoute({
  method: "get",
  path: "/download/{id}",
  tags: ["Storage"],
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/octet-stream": {
          schema: z.instanceof(Blob).openapi({ type: "string", format: "binary" }),
        },
      },
      description: "File downloaded successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid file ID",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "File not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// ファイル情報取得ルート定義
const getFileInfoRoute = createRoute({
  method: "get",
  path: "/files/{id}",
  tags: ["Storage"],
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: FileResponseSchema,
        },
      },
      description: "File info retrieved successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid file ID",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "File not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// ファイル一覧取得ルート定義
const listFilesRoute = createRoute({
  method: "get",
  path: "/files",
  tags: ["Storage"],
  request: {
    query: z.object({
      folder: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: FileListResponseSchema,
        },
      },
      description: "Files retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// ファイル削除ルート定義
const deleteFileRoute = createRoute({
  method: "delete",
  path: "/files/{id}",
  tags: ["Storage"],
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "File deleted successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid file ID",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "File not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

/**
 * ストレージルートのファクトリー関数
 * コントローラーを引数で受け取り、OpenAPIHonoインスタンスを返す
 */
export const createStorageRoutes = (controller: StorageController) => {
  const app = new OpenAPIHono();

  app.openapi(uploadFileRoute, controller.upload);
  app.openapi(downloadFileRoute, controller.download);
  app.openapi(getFileInfoRoute, controller.getFileInfo);
  app.openapi(listFilesRoute, controller.listFiles);
  app.openapi(deleteFileRoute, controller.deleteFile);

  return app;
};
