type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

export const logger = {
  info: (message: string, data?: unknown): void => {
    const formatted = formatMessage("INFO", message, data);
    console.log(formatted);
  },

  warn: (message: string, data?: unknown): void => {
    const formatted = formatMessage("WARN", message, data);
    console.warn(formatted);
  },

  error: (message: string, data?: unknown): void => {
    const formatted = formatMessage("ERROR", message, data);
    console.error(formatted);
  },

  debug: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === "development") {
      const formatted = formatMessage("DEBUG", message, data);
      console.debug(formatted);
    }
  },
};

export default logger;
