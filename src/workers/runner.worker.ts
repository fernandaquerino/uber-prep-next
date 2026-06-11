type RunnerTestCase = {
  input: string;
  expected: string;
};

type RunnerMode = "run" | "test";

type RunnerMessage = {
  code: string;
  testCases: RunnerTestCase[];
  runMode: RunnerMode;
};

type RunnerTestResult = {
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  isError: boolean;
};

const formatConsoleValue = (value: unknown): string => {
  try {
    return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  } catch {
    return "[circular]";
  }
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

function normalizeComparable(value: unknown): unknown {
  if (typeof value === "number" && Number.isNaN(value)) return "__NaN__";
  if (value === undefined) return "__undefined__";
  if (value instanceof Map) {
    return {
      __type: "Map",
      entries: [...value.entries()].map(([key, entryValue]) => [
        normalizeComparable(key),
        normalizeComparable(entryValue),
      ]),
    };
  }
  if (value instanceof Set) {
    return {
      __type: "Set",
      values: [...value.values()].map(normalizeComparable).sort(compareSerialized),
    };
  }
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, normalizeComparable(entryValue)]),
    );
  }

  return value;
}

function compareSerialized(left: unknown, right: unknown): number {
  return stringifyComparable(left).localeCompare(stringifyComparable(right));
}

function stringifyComparable(value: unknown): string {
  return JSON.stringify(normalizeComparable(value)) ?? "__undefined__";
}

function formatResult(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "number" && Number.isNaN(value)) return "NaN";
  return formatConsoleValue(value);
}

self.onmessage = async function (event: MessageEvent<RunnerMessage>) {
  const { code, testCases, runMode } = event.data;
  const logs: string[] = [];

  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(formatConsoleValue).join(" ")),
    error: (...args: unknown[]) => logs.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) => logs.push("[warn] " + args.map(String).join(" ")),
    info: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
  };

  const testResults: RunnerTestResult[] = [];

  try {
    if (runMode === "test" && testCases.length > 0) {
      for (const testCase of testCases) {
        if (!testCase.input.trim()) continue;

        try {
          const fn = new Function("console", `${code}\nreturn (${testCase.input})`);
          const result = (await fn(fakeConsole)) as unknown;
          const resultString = formatResult(result);
          let pass = false;

          try {
            const expected = JSON.parse(testCase.expected) as unknown;
            pass = stringifyComparable(expected) === stringifyComparable(result);
          } catch {
            pass = String(result) === testCase.expected.trim();
          }

          testResults.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: resultString,
            pass,
            isError: false,
          });
        } catch (error) {
          testResults.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: getErrorMessage(error),
            pass: false,
            isError: true,
          });
        }
      }
    } else {
      const fn = new Function("console", code);
      await fn(fakeConsole);
    }

    self.postMessage({ logs, testResults, error: null });
  } catch (error) {
    self.postMessage({ logs, testResults, error: getErrorMessage(error) });
  }
};
