/**
 * Utility to generate concise starter code templates and function skeletons
 * for all supported programming languages.
 */

// Helper to determine a default return value based on return type
export function getDefaultReturnValue(returnType, language) {
  const normType = (returnType || "").toLowerCase().trim();
  const lang = (language || "").toLowerCase().trim();

  if (normType.includes("void")) {
    return "";
  }
  if (normType.includes("bool")) {
    return lang === "python" ? "False" : "false";
  }
  if (
    normType.includes("int") ||
    normType.includes("long") ||
    normType.includes("short") ||
    normType.includes("byte") ||
    normType === "number" ||
    normType.includes("float") ||
    normType.includes("double")
  ) {
    if (normType.includes("[]") || normType.includes("*") || normType.includes("vector") || normType.includes("list")) {
      if (lang === "python" || lang === "javascript") return "[]";
      if (lang === "java") return "new int[]{}";
      if (lang === "cpp") return "{}";
      return "NULL";
    }
    return "0";
  }
  if (normType.includes("char*") || normType.includes("string") || normType === "str") {
    if (lang === "c") return '""';
    return '""';
  }
  if (normType.includes("[]") || normType.includes("array") || normType.includes("vector") || normType.includes("list")) {
    if (lang === "python" || lang === "javascript") return "[]";
    if (lang === "java") return "null";
    if (lang === "cpp") return "{}";
    return "NULL";
  }

  // Generic fallback
  if (lang === "python") return "None";
  if (lang === "c" || lang === "cpp") return "0";
  return "null";
}

/**
 * Normalizes parameter string for language conventions
 */
export function normalizeParamsForLanguage(params, language) {
  if (!params || !params.trim()) {
    if (language === "c" || language === "cpp" || language === "java") return "int n";
    return "n";
  }

  const raw = params.trim();

  if (language === "python" || language === "javascript") {
    // Clean parameter names without static type prefixes (e.g., 'int a, int b' -> 'a, b')
    return raw
      .split(",")
      .map((p) => {
        const parts = p.trim().split(/\s+/);
        return parts[parts.length - 1].replace(/[\[\]*&]/g, "");
      })
      .filter(Boolean)
      .join(", ");
  }

  // C, C++, Java: ensure each parameter has a type if omitted
  return raw
    .split(",")
    .map((p) => {
      const trimmed = p.trim();
      const parts = trimmed.split(/\s+/);
      if (parts.length === 1 && !["int", "float", "double", "char", "bool", "void", "String", "string"].includes(parts[0])) {
        return `int ${trimmed}`;
      }
      return trimmed;
    })
    .join(", ");
}

/**
 * Generate a concise starter code template for a given language and function signature.
 */
export function generateStarterCode({
  language = "c",
  functionName = "solution",
  returnType = "int",
  parameters = "int n",
}) {
  const lang = (language || "c").toLowerCase().trim();
  const fnName = (functionName || "solution").trim();
  const retType = (returnType || "int").trim();
  const rawParams = (parameters || "int n").trim();
  const defaultRet = getDefaultReturnValue(retType, lang);
  const isVoid = retType.toLowerCase().includes("void");

  // Extract raw parameter names
  const paramNames = rawParams
    .split(",")
    .map((p) => {
      const parts = p.trim().split(/\s+/);
      return parts[parts.length - 1].replace(/[\[\]*&]/g, "");
    })
    .filter(Boolean);

  const callArgs = paramNames.join(", ");

  switch (lang) {
    case "c": {
      const cParams = normalizeParamsForLanguage(rawParams, "c");
      const fnReturnStmt = isVoid ? "" : `\n    return ${defaultRet};`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        const p0 = paramNames[0] || "n";
        const callStmt = isVoid
          ? `${fnName}(${p0});`
          : `printf("%d\\n", ${fnName}(${p0}));`;
        driverBody = `    int ${p0};\n    scanf("%d", &${p0});\n    ${callStmt}`;
      } else {
        const decl = `int ${paramNames.join(", ")};`;
        const fmt = paramNames.map(() => "%d").join(" ");
        const addrs = paramNames.map((p) => `&${p}`).join(", ");
        const callStmt = isVoid
          ? `${fnName}(${callArgs});`
          : `printf("%d\\n", ${fnName}(${callArgs}));`;
        driverBody = `    ${decl}\n    scanf("${fmt}", ${addrs});\n    ${callStmt}`;
      }

      return `#include <stdio.h>

${retType} ${fnName}(${cParams}) {
    // Write your code here${fnReturnStmt}
}

int main() {
${driverBody}
    return 0;
}`;
    }

    case "cpp": {
      const cppParams = normalizeParamsForLanguage(rawParams, "cpp");
      const fnReturnStmt = isVoid ? "" : `\n    return ${defaultRet};`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        const p0 = paramNames[0] || "n";
        const callStmt = isVoid
          ? `${fnName}(${p0});`
          : `cout << ${fnName}(${p0}) << endl;`;
        driverBody = `    int ${p0};\n    cin >> ${p0};\n    ${callStmt}`;
      } else {
        const decl = `int ${paramNames.join(", ")};`;
        const cinStmt = `cin >> ${paramNames.join(" >> ")};`;
        const callStmt = isVoid
          ? `${fnName}(${callArgs});`
          : `cout << ${fnName}(${callArgs}) << endl;`;
        driverBody = `    ${decl}\n    ${cinStmt}\n    ${callStmt}`;
      }

      return `#include <iostream>
using namespace std;

${retType} ${fnName}(${cppParams}) {
    // Write your code here${fnReturnStmt}
}

int main() {
${driverBody}
    return 0;
}`;
    }

    case "java": {
      const javaParams = normalizeParamsForLanguage(rawParams, "java");
      const fnReturnStmt = isVoid ? "" : `\n        return ${defaultRet};`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        const p0 = paramNames[0] || "n";
        const callStmt = isVoid
          ? `${fnName}(${p0});`
          : `System.out.println(${fnName}(${p0}));`;
        driverBody = `        Scanner sc = new Scanner(System.in);\n        int ${p0} = sc.nextInt();\n        ${callStmt}`;
      } else {
        const readStmts = paramNames.map((p) => `int ${p} = sc.nextInt();`).join("\n        ");
        const callStmt = isVoid
          ? `${fnName}(${callArgs});`
          : `System.out.println(${fnName}(${callArgs}));`;
        driverBody = `        Scanner sc = new Scanner(System.in);\n        ${readStmts}\n        ${callStmt}`;
      }

      return `import java.util.Scanner;

public class Main {
    public static ${retType} ${fnName}(${javaParams}) {
        // Write your code here${fnReturnStmt}
    }

    public static void main(String[] args) {
${driverBody}
    }
}`;
    }

    case "python": {
      const pyParams = normalizeParamsForLanguage(rawParams, "python");
      const fnReturnStmt = isVoid ? "\n    pass" : `\n    return ${defaultRet}`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        const p0 = paramNames[0] || "n";
        const callStmt = isVoid
          ? `    ${fnName}(${p0})`
          : `    print(${fnName}(${p0}))`;
        driverBody = `    ${p0} = int(input())\n${callStmt}`;
      } else {
        const callStmt = isVoid
          ? `    ${fnName}(${callArgs})`
          : `    print(${fnName}(${callArgs}))`;
        driverBody = `    ${paramNames.join(", ")} = map(int, input().split())\n${callStmt}`;
      }

      return `def ${fnName}(${pyParams}):
    # Write your code here${fnReturnStmt}

if __name__ == "__main__":
${driverBody}`;
    }

    case "javascript": {
      const jsParams = normalizeParamsForLanguage(rawParams, "javascript");
      const fnReturnStmt = isVoid ? "" : `\n    return ${defaultRet};`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        const p0 = paramNames[0] || "n";
        const callStmt = isVoid
          ? `    ${fnName}(${p0});`
          : `    console.log(${fnName}(${p0}));`;
        driverBody = `const input = fs.readFileSync(0, "utf-8").trim();\nif (input) {\n    const ${p0} = parseInt(input, 10);\n${callStmt}\n}`;
      } else {
        const callStmt = isVoid
          ? `    ${fnName}(${callArgs});`
          : `    console.log(${fnName}(${callArgs}));`;
        driverBody = `const input = fs.readFileSync(0, "utf-8").trim();\nif (input) {\n    const [${paramNames.join(", ")}] = input.split(/\\s+/).map(Number);\n${callStmt}\n}`;
      }

      return `const fs = require("fs");

function ${fnName}(${jsParams}) {
    // Write your code here${fnReturnStmt}
}

${driverBody}`;
    }

    default:
      return `// Solution Template for ${fnName}\n`;
  }
}
