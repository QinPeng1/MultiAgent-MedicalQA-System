import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  mimoApiKey: string;
  mimoApiBaseUrl: string;
  mimoModel: string;
  chromaDbPath: string;
  logLevel: string;
}

export const config: AppConfig = {
  mimoApiKey: process.env.MIMO_API_KEY || "",
  mimoApiBaseUrl: process.env.MIMO_API_BASE_URL || "https://api.mimo.com/v1",
  mimoModel: process.env.MIMO_MODEL || "mimo-v1",
  chromaDbPath: process.env.CHROMA_DB_PATH || "./chroma_db",
  logLevel: process.env.LOG_LEVEL || "info",
};

if (!config.mimoApiKey) {
  console.error("警告：MIMO_API_KEY 未设置");
}
