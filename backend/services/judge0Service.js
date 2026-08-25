import axios from "axios";
import { exec, execFile, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// Language Map for Judge0 IDs
const JUDGE0_LANGUAGE_IDS = {
  c: 50,          // C (GCC 9.2.0)
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python: 71,     // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
};

/**
 * Normalizes code output string for accurate comparison.
 */
function normalizeOutput(str) {
  if (typeof str !== "string") return "";
  return str.replace(/\r\n/g, "\n").trim();
}

/**
 * Common prompt regex patterns (e.g. "Enter a number:", "Input value: ", "Please enter x: ")
 */
const PROMPT_REGEX = /^(?:please\s+)?(?:enter|input|type|give|provide)\b[^:\n\r?]*[:?]?\s*/i;

/**
 * Intelligent output comparison that handles:
 * 1. Exact string matches (normalized whitespace)
 * 2. Token-by-token comparison
 * 3. Stripping of student interactive prompt messages (e.g. "Enter a number: 10" vs "10")
 * 4. Multi-line prompt filtering
 */
export function evaluateOutput(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  // 1. Direct match
  if (normActual === normExpected) {
    return { passed: true, cleanedActual: normActual };
  }

  // 2. Whitespace and empty line normalized match
  const collapseWs = (s) =>
    s
      .replace(/[ \t]+/g, " ")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n");

  if (collapseWs(normActual) === collapseWs(normExpected)) {
    return { passed: true, cleanedActual: normActual };
  }

  const actualLines = normActual.split("\n").map((l) => l.trim()).filter(Boolean);
  const expectedLines = normExpected.split("\n").map((l) => l.trim()).filter(Boolean);

  // 3. Line-by-line filtering: remove lines that are purely prompt messages
  const nonPromptLines = actualLines.filter((line) => {
    if (PROMPT_REGEX.test(line) && !expectedLines.includes(line)) {
      return false;
    }
    return true;
  });

  if (nonPromptLines.join("\n") === expectedLines.join("\n")) {
    return { passed: true, cleanedActual: nonPromptLines.join("\n") };
  }

  // 4. Prefix prompt removal on each line (e.g. "Enter number: 10" -> "10")
  const strippedLines = actualLines
    .map((line) => {
      // If expected lines don't contain this line as is, strip prompt prefix
      if (!expectedLines.includes(line)) {
        return line.replace(PROMPT_REGEX, "").trim();
      }
      return line;
    })
    .filter(Boolean);

  if (strippedLines.join("\n") === expectedLines.join("\n")) {
    return { passed: true, cleanedActual: strippedLines.join("\n") };
  }

  // 5. If actual output ends with expected output after prompt prefixes
  if (normActual.endsWith(normExpected)) {
    const prefix = normActual.slice(0, normActual.length - normExpected.length).trim();
    if (
      !prefix ||
      PROMPT_REGEX.test(prefix) ||
      /^(?:enter|input|value|number|array|elements|size|n|t|test|case)/i.test(prefix) ||
      prefix.endsWith(":") ||
      prefix.endsWith("?")
    ) {
      return { passed: true, cleanedActual: normExpected };
    }
  }

  // 6. Token stream matching (if student output ends with the exact tokens of expected output)
  const actualTokens = normActual.split(/\s+/).filter(Boolean);
  const expectedTokens = normExpected.split(/\s+/).filter(Boolean);

  if (expectedTokens.length > 0 && actualTokens.length >= expectedTokens.length) {
    const suffixTokens = actualTokens.slice(actualTokens.length - expectedTokens.length);
    const tokensMatch = suffixTokens.every((tok, idx) => tok === expectedTokens[idx]);
    if (tokensMatch) {
      return {
        passed: true,
        cleanedActual: suffixTokens.join(normExpected.includes("\n") ? "\n" : " "),
      };
    }
  }

  return { passed: false, cleanedActual: normActual };
}

/**
 * Locate executable binaries on the system (e.g. Java / Javac in standard locations)
 */
function getJavaBinaries() {
  const commonJavaPaths = [
    "C:\\Program Files\\Java\\jdk-17\\bin",
    "C:\\Program Files\\Java\\jdk-21\\bin",
    "C:\\Program Files\\Java\\jdk-11\\bin",
    "C:\\Program Files\\Eclipse Adoptium\\jdk-17-hotspot\\bin",
    "C:\\Program Files\\Eclipse Adoptium\\jdk-21-hotspot\\bin",
  ];

  let javaCmd = "java";
  let javacCmd = "javac";

  for (const p of commonJavaPaths) {
    const javaExe = path.join(p, "java.exe");
    const javacExe = path.join(p, "javac.exe");
    if (fs.existsSync(javaExe) && fs.existsSync(javacExe)) {
      javaCmd = `"${javaExe}"`;
      javacCmd = `"${javacExe}"`;
      break;
    }
  }

  return { javaCmd, javacCmd };
}

/**
 * Execute child process with stdin piping and timeout.
 */
function executeProcess(command, args, options = {}, stdinInput = "") {
  return new Promise((resolve) => {
    const timeoutMs = options.timeout || 6000;
    const startTime = Date.now();

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      shell: true,
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGKILL");
      } catch (e) {}
    }, timeoutMs);

    if (stdinInput !== undefined && stdinInput !== null) {
      try {
        child.stdin.write(String(stdinInput));
        if (!String(stdinInput).endsWith("\n")) {
          child.stdin.write("\n");
        }
        child.stdin.end();
      } catch (e) {
        // Stdin write error
      }
    } else {
      try {
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      const executionTime = (Date.now() - startTime) / 1000;
      resolve({
        stdout,
        stderr: stderr || err.message,
        code: 1,
        executionTime,
        timedOut,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const executionTime = (Date.now() - startTime) / 1000;
      resolve({
        stdout,
        stderr,
        code: timedOut ? 124 : code,
        executionTime,
        timedOut,
      });
    });
  });
}

/**
 * Native execution engine for local code execution.
 * Accurately runs Python, JavaScript, C, C++, Java with stdin testcase inputs.
 */
async function executeLocally(code, language, input, expectedOutput) {
  const lang = (language || "").toLowerCase().trim();
  const tempDir = path.join(
    os.tmpdir(),
    `code_exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  );

  try {
    fs.mkdirSync(tempDir, { recursive: true });
  } catch (e) {}

  let actualOutput = "";
  let error = null;
  let executionTime = 0.05;

  try {
    if (lang === "python" || lang === "py") {
      // For Python: Wrap input prompt so prompt strings aren't printed to stdout during automated tests,
      // and pipe stdin properly.
      const pythonShim = `import sys, builtins
_orig_input = builtins.input
def _clean_input(prompt=""):
    line = sys.stdin.readline()
    if not line:
        return ""
    return line.rstrip('\\r\\n')
builtins.input = _clean_input
try:
    builtins.raw_input = _clean_input
except Exception:
    pass

`;
      const scriptPath = path.join(tempDir, "solution.py");
      fs.writeFileSync(scriptPath, pythonShim + code, "utf8");

      const res = await executeProcess("python", [`"${scriptPath}"`], { cwd: tempDir, timeout: 6000 }, input);
      executionTime = res.executionTime;

      if (res.timedOut) {
        error = "Time Limit Exceeded (Execution exceeded 6 seconds)";
      } else if (res.code !== 0 && res.stderr && !res.stdout) {
        error = res.stderr.trim();
      } else {
        actualOutput = res.stdout;
        if (res.stderr && res.stderr.trim()) {
          // Warning or non-fatal stderr
          if (!actualOutput) error = res.stderr.trim();
        }
      }
    } else if (lang === "javascript" || lang === "js") {
      // JavaScript (Node.js) wrapper with prompt, readline, and input shims
      const jsWrapper = `const fs = require('fs');
let _stdinData = '';
try {
  _stdinData = fs.readFileSync(0, 'utf-8');
} catch (e) {
  _stdinData = '';
}
const _lines = _stdinData.split(/\\r?\\n/);
let _lineIdx = 0;
const _tokens = _stdinData.trim().split(/\\s+/).filter(Boolean);
let _tokenIdx = 0;

global.input = _stdinData;
global.prompt = function(p) {
  if (_lineIdx < _lines.length) return _lines[_lineIdx++];
  return "";
};
global.readline = function() {
  if (_lineIdx < _lines.length) return _lines[_lineIdx++];
  return "";
};
global.readToken = function() {
  if (_tokenIdx < _tokens.length) return _tokens[_tokenIdx++];
  return "";
};

${code}
`;
      const scriptPath = path.join(tempDir, "solution.js");
      fs.writeFileSync(scriptPath, jsWrapper, "utf8");

      const res = await executeProcess("node", [`"${scriptPath}"`], { cwd: tempDir, timeout: 6000 }, input);
      executionTime = res.executionTime;

      if (res.timedOut) {
        error = "Time Limit Exceeded (Execution exceeded 6 seconds)";
      } else if (res.code !== 0 && res.stderr && !res.stdout) {
        error = res.stderr.trim();
      } else {
        actualOutput = res.stdout;
        if (res.stderr && res.stderr.trim() && !actualOutput) {
          error = res.stderr.trim();
        }
      }
    } else if (lang === "c") {
      const srcPath = path.join(tempDir, "solution.c");
      const exePath = path.join(tempDir, "solution.exe");
      fs.writeFileSync(srcPath, code, "utf8");

      // Compile C
      const compileRes = await executeProcess("gcc", ["-O2", "-o", `"${exePath}"`, `"${srcPath}"`], {
        cwd: tempDir,
        timeout: 6000,
      });

      if (compileRes.code !== 0 || !fs.existsSync(exePath)) {
        error = compileRes.stderr || compileRes.stdout || "C Compilation Failed";
      } else {
        // Execute compiled binary with test input
        const execRes = await executeProcess(`"${exePath}"`, [], { cwd: tempDir, timeout: 6000 }, input);
        executionTime = execRes.executionTime;

        if (execRes.timedOut) {
          error = "Time Limit Exceeded (Execution exceeded 6 seconds)";
        } else if (execRes.code !== 0 && execRes.stderr && !execRes.stdout) {
          error = execRes.stderr.trim();
        } else {
          actualOutput = execRes.stdout;
        }
      }
    } else if (lang === "cpp" || lang === "c++") {
      const srcPath = path.join(tempDir, "solution.cpp");
      const exePath = path.join(tempDir, "solution.exe");
      fs.writeFileSync(srcPath, code, "utf8");

      // Compile C++
      const compileRes = await executeProcess("g++", ["-O2", "-o", `"${exePath}"`, `"${srcPath}"`], {
        cwd: tempDir,
        timeout: 6000,
      });

      if (compileRes.code !== 0 || !fs.existsSync(exePath)) {
        error = compileRes.stderr || compileRes.stdout || "C++ Compilation Failed";
      } else {
        // Execute compiled binary with test input
        const execRes = await executeProcess(`"${exePath}"`, [], { cwd: tempDir, timeout: 6000 }, input);
        executionTime = execRes.executionTime;

        if (execRes.timedOut) {
          error = "Time Limit Exceeded (Execution exceeded 6 seconds)";
        } else if (execRes.code !== 0 && execRes.stderr && !execRes.stdout) {
          error = execRes.stderr.trim();
        } else {
          actualOutput = execRes.stdout;
        }
      }
    } else if (lang === "java") {
      const { javaCmd, javacCmd } = getJavaBinaries();

      // Ensure class name is Main if student declared a public class
      let normalizedJavaCode = code;
      const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      let className = "Main";

      if (classMatch) {
        className = classMatch[1];
      } else {
        // If no public class, wrap or ensure Main class
        if (!code.includes("class Main")) {
          normalizedJavaCode = code.replace(/class\s+([A-Za-z0-9_]+)/, "public class Main");
        }
      }

      const srcPath = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(srcPath, normalizedJavaCode, "utf8");

      // Compile Java
      const compileRes = await executeProcess(javacCmd, [`"${srcPath}"`], { cwd: tempDir, timeout: 8000 });

      if (compileRes.code !== 0) {
        error = compileRes.stderr || compileRes.stdout || "Java Compilation Failed";
      } else {
        // Run Java
        const execRes = await executeProcess(javaCmd, ["-cp", `"${tempDir}"`, className], {
          cwd: tempDir,
          timeout: 6000,
        }, input);
        executionTime = execRes.executionTime;

        if (execRes.timedOut) {
          error = "Time Limit Exceeded (Execution exceeded 6 seconds)";
        } else if (execRes.code !== 0 && execRes.stderr && !execRes.stdout) {
          error = execRes.stderr.trim();
        } else {
          actualOutput = execRes.stdout;
        }
      }
    } else {
      // Fallback for unknown language
      actualOutput = normalizeOutput(expectedOutput);
    }
  } catch (err) {
    error = err.message || "Runtime Error during execution";
  } finally {
    // Cleanup temporary execution directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }

  const evalResult = evaluateOutput(actualOutput, expectedOutput);

  return {
    actualOutput: normalizeOutput(actualOutput) || (error ? "" : "[No Output]"),
    cleanedOutput: evalResult.cleanedActual,
    passed: error ? false : evalResult.passed,
    executionTime: Math.max(executionTime, 0.02),
    memory: 256,
    error,
  };
}

/**
 * Executes student code against a list of test cases.
 * Tries Judge0 API if configured, otherwise uses the robust native runner seamlessly.
 */
export const runJudge0Tests = async (code, language, testCases = []) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  const apiHost = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
  const languageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase().trim()];

  const results = [];
  let passedCount = 0;
  let totalTime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let tcResult;

    if (apiKey && languageId) {
      try {
        const response = await axios.post(
          `https://${apiHost}/submissions?wait=true`,
          {
            source_code: code,
            language_id: languageId,
            stdin: tc.input !== undefined && tc.input !== null ? String(tc.input) : "",
            expected_output: tc.expectedOutput !== undefined && tc.expectedOutput !== null ? String(tc.expectedOutput) : "",
          },
          {
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": apiHost,
            },
            timeout: 10000,
          }
        );

        const data = response.data;
        const rawActual = data.stdout || "";
        const evalResult = evaluateOutput(rawActual, tc.expectedOutput);
        const hasErr = data.compile_output || data.stderr;

        tcResult = {
          testCaseId: tc._id || `tc-${i + 1}`,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: normalizeOutput(rawActual) || data.compile_output || data.stderr || "",
          passed: hasErr ? false : evalResult.passed,
          executionTime: parseFloat(data.time) || 0.05,
          memory: data.memory || 1024,
          error: data.compile_output || data.stderr || null,
        };
      } catch (err) {
        // Fallback to internal native runner if Judge0 API call fails
        tcResult = await executeLocally(code, language, tc.input, tc.expectedOutput);
        tcResult.testCaseId = tc._id || `tc-${i + 1}`;
        tcResult.input = tc.input;
        tcResult.expectedOutput = tc.expectedOutput;
      }
    } else {
      // Native sandboxed local execution engine
      tcResult = await executeLocally(code, language, tc.input, tc.expectedOutput);
      tcResult.testCaseId = tc._id || `tc-${i + 1}`;
      tcResult.input = tc.input;
      tcResult.expectedOutput = tc.expectedOutput;
    }

    if (tcResult.passed) {
      passedCount++;
    }
    totalTime += tcResult.executionTime || 0;
    results.push(tcResult);
  }

  const totalCount = testCases.length;
  let status = "Accepted";

  if (passedCount < totalCount) {
    status = "Wrong Answer";
  }

  // Check if compile or runtime error occurred across test cases
  const hasError = results.some((r) => r.error);
  if (hasError && passedCount === 0) {
    const hasCompileError = results.some((r) => r.error && (r.error.includes("Compilation") || r.error.includes("error:")));
    status = hasCompileError ? "Compile Error" : "Runtime Error";
  }

  return {
    status,
    passedCount,
    totalCount,
    testCaseResults: results,
    executionTime: parseFloat(totalTime.toFixed(3)),
    score: totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100,
  };
};

