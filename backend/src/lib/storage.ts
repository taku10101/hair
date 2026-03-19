import { Client } from "minio";
import { env } from "@/lib/env";

let minioClientInstance: Client | undefined;

/**
 * MinIOクライアントのファクトリー関数
 * シングルトンインスタンスを返す
 */
export const getMinioClient = (): Client => {
  if (!minioClientInstance) {
    minioClientInstance = new Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }

  return minioClientInstance;
};

/**
 * MinIOバケットの初期化
 * バケットが存在しない場合は自動作成する
 */
export async function initializeMinIOBucket(): Promise<void> {
  try {
    const client = getMinioClient();
    const bucketExists = await client.bucketExists(env.MINIO_BUCKET_NAME);

    if (!bucketExists) {
      await client.makeBucket(env.MINIO_BUCKET_NAME, "us-east-1");
    }
  } catch (error) {
    throw new Error(
      `MinIOバケットの初期化エラー: ${error instanceof Error ? error.message : "不明なエラー"}`
    );
  }
}

/**
 * MinIO接続のヘルスチェック
 * MinIOサーバーへの接続を確認する
 */
export async function checkMinIOHealth(): Promise<boolean> {
  try {
    const client = getMinioClient();
    await client.bucketExists(env.MINIO_BUCKET_NAME);
    return true;
  } catch {
    return false;
  }
}
