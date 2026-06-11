self.onmessage = async function (e) {
  const { code, testCases, runMode } = e.data
  const logs = []

  const fakeConsole = {
    log: (...args) => logs.push(args.map(a => {
      try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a) } catch { return '[circular]' }
    }).join(' ')),
    error: (...args) => logs.push('[error] ' + args.map(String).join(' ')),
    warn: (...args) => logs.push('[warn] ' + args.map(String).join(' ')),
    info: (...args) => logs.push(args.map(String).join(' ')),
  }

  const testResults = []

  try {
    if (runMode === 'test' && testCases && testCases.length > 0) {
      for (const tc of testCases) {
        if (!tc.input.trim()) continue
        try {
          const fn = new Function('console', code + '\nreturn (' + tc.input + ')')
          const result = await fn(fakeConsole)
          const resultStr = JSON.stringify(result)
          let pass = false
          try {
            const expected = JSON.parse(tc.expected)
            pass = JSON.stringify(expected) === resultStr
          } catch {
            pass = String(result) === tc.expected.trim()
          }
          testResults.push({ input: tc.input, expected: tc.expected, actual: resultStr, pass, isError: false })
        } catch (err) {
          testResults.push({ input: tc.input, expected: tc.expected, actual: err.message, pass: false, isError: true })
        }
      }
    } else {
      const fn = new Function('console', code)
      await fn(fakeConsole)
    }

    self.postMessage({ logs, testResults, error: null })
  } catch (err) {
    self.postMessage({ logs, testResults, error: err.message })
  }
}
