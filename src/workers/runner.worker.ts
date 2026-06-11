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
          const resultString = JSON.stringify(result);
          let pass = false;

          try {
            const expected = JSON.parse(testCase.expected) as unknown;
            pass = JSON.stringify(expected) === resultString;
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
