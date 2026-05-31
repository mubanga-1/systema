const COLORS: Record<string, string> = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let initialized = false;

type LogValue = unknown;

type ConsoleWithJson = Console & {
  logJSON?: (obj: LogValue, label?: string) => void;
};

function timeStamp() {
  return new Date().toISOString();
}

function format(level: string, args: LogValue[]) {
  const prefix = `${COLORS.cyan}[${timeStamp()}]${COLORS.reset}`;
  const levelColor = level === 'ERROR' ? COLORS.red : level === 'WARN' ? COLORS.yellow : COLORS.green;
  const lvl = `${levelColor}${level}${COLORS.reset}`;
  return [prefix, lvl, ...args];
}

export function initLogging() {
  if (initialized) return;
  initialized = true;

  const origLog = console.log.bind(console);
  const origInfo = console.info.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);

  console.log = (...args: LogValue[]) => origLog(...format('INFO', args));
  console.info = (...args: LogValue[]) => origInfo(...format('INFO', args));
  console.warn = (...args: LogValue[]) => origWarn(...format('WARN', args));
  console.error = (...args: LogValue[]) => origError(...format('ERROR', args));

  process.on('uncaughtException', (err) => {
    origError(...format('FATAL', ['Uncaught Exception: ', err && err.stack ? err.stack : err]));
    // keep process alive for debugging in dev
  });

  process.on('unhandledRejection', (reason) => {
    origError(...format('FATAL', ['Unhandled Rejection: ', reason]));
  });

  // Optionally add a small helper to log structured objects as JSON
  (console as ConsoleWithJson).logJSON = (obj: LogValue, label = 'data') => {
    try {
      origLog(...format('INFO', [label, JSON.stringify(obj, null, 2)]));
    } catch {
      origLog(...format('INFO', [label, obj]));
    }
  };
}

export function logInfo(...args: LogValue[]) {
  console.log(...args);
}

export function logWarn(...args: LogValue[]) {
  console.warn(...args);
}

export function logError(...args: LogValue[]) {
  console.error(...args);
}

const logger = { initLogging, logInfo, logWarn, logError };

export default logger;
