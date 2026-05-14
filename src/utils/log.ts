export interface LoggerContext {
  info?(message: string): void;
}

export function logGeneratedNotice(
  context: LoggerContext | undefined,
  file: string,
) {
  const message = `Generated ${file}.`;

  if (context?.info) {
    context.info(message);
    return;
  }

  console.info(`[unplugin-license] ${message}`);
}
