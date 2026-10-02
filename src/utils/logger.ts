import { AxiosError } from "axios";

export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

function printAxiosError(e: AxiosError) {
  const env = import.meta.env.DEV ? "dev" : "prod";
  const mapper = {
    400: "Yêu cầu không hợp lệ",
    401: "Chưa xác thực",
    404: "Không tìm thấy tài nguyên",
    410: "Tài nguyên đã bị xoá",
    500: "Lỗi server",
    999: "Lỗi yêu cầu không xác định",
  };
  return `${(mapper as Record<number, string>)[e.status || 999]}${env === "dev" ? `. ${e.message.slice(0, 300)}` : ""}`;
}

export function getErrorMessage(e: unknown) {
  devLog(e);
  const env = import.meta.env.DEV ? "dev" : "prod";
  if (e instanceof AxiosError) return printAxiosError(e);
  else if (e instanceof Error)
    return `Lỗi hệ thống${env === "dev" ? `. ${e.message.slice(0, 300)}` : ""}`;
  else return `Lỗi không xác đinh${env === "dev" ? `. ${e}` : ""}`;
}
