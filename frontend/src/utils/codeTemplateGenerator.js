/**
 * Utility to generate boilerplate function signatures, return types, return value placeholders,
 * and input driver test harnesses for all supported programming languages.
 */

// Helper to determine a reasonable default return value based on return type
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
      if (lang === "python") return "[]";
      if (lang === "javascript") return "[]";
      if (lang === "java") return "new int[]{}";
      if (lang === "cpp") return "{}";
      return "NULL";
    }
    return "0";
  }
  if (normType.includes("char*") || normType.includes("string") || normType === "str") {
    if (lang === "c") return '""';
    if (lang === "python") return '""';
    if (lang === "java") return '""';
    if (lang === "cpp") return '""';
    return '""';
  }
  if (normType.includes("[]") || normType.includes("array") || normType.includes("vector") || normType.includes("list")) {
    if (lang === "python") return "[]";
    if (lang === "javascript") return "[]";
    if (lang === "java") return "null";
    if (lang === "cpp") return "{}";
    return "NULL";
  }

  // Generic fallback
  if (lang === "python") return "None";
  if (lang === "c") return "0";
  if (lang === "cpp") return "0";
  if (lang === "java") return "null";
  return "null";
}

/**
 * Normalizes parameter string for language conventions
 */
export function normalizeParamsForLanguage(params, language) {
  if (!params || !params.trim()) {
    if (language === "c" || language === "cpp") return "int n";
    if (language === "java") return "int n";
    if (language === "python") return "n: int";
    return "n";
  }

  const raw = params.trim();

  if (language === "python") {
    // If user typed 'int a, int b' convert to 'a, b' or 'a: int, b: int'
    return raw
      .split(",")
      .map((p) => {
        const parts = p.trim().split(/\s+/);
        if (parts.length >= 2) {
          const type = parts[0];
          const name = parts[parts.length - 1].replace(/[\[\]*]/g, "");
          return `${name}: ${type === "int" ? "int" : type === "string" || type === "String" ? "str" : type === "float" || type === "double" ? "float" : "any"}`;
        }
        return p.trim();
      })
      .join(", ");
  }

  if (language === "javascript") {
    // Strip static types if provided like 'int a, int b' -> 'a, b'
    return raw
      .split(",")
      .map((p) => {
        const parts = p.trim().split(/\s+/);
        return parts[parts.length - 1].replace(/[\[\]*]/g, "");
      })
      .join(", ");
  }

  return raw;
}

/**
 * Generate standard starter code template for a given language and function specification.
 */
export function generateStarterCode({
  language = "c",
  functionName = "solution",
  returnType = "int",
  parameters = "int n",
  description = "",
}) {
  const lang = (language || "c").toLowerCase().trim();
  const fnName = (functionName || "solution").trim();
  const retType = (returnType || "int").trim();
  const rawParams = (parameters || "int n").trim();
  const defaultRet = getDefaultReturnValue(retType, lang);

  // Extract parameter names for function call in driver
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
      const paramStr = rawParams.includes("int") || rawParams.includes("char") || rawParams.includes("float") || rawParams.includes("double") || rawParams.includes("bool") || rawParams.includes("void")
        ? rawParams
        : `int ${rawParams}`;

      // Check if multiple args or single arg
      let driverBody = "";
      if (paramNames.length <= 1) {
        driverBody = `    int ${paramNames[0] || "n"};\n    if (scanf("%d", &${paramNames[0] || "n"}) == 1) {\n        printf("%d\\n", ${fnName}(${paramNames[0] || "n"}));\n    }`;
      } else if (paramNames.length === 2) {
        driverBody = `    int ${paramNames[0]}, ${paramNames[1]};\n    if (scanf("%d %d", &${paramNames[0]}, &${paramNames[1]}) == 2) {\n        printf("%d\\n", ${fnName}(${paramNames[0]}, ${paramNames[1]}));\n    }`;
      } else {
        driverBody = `    // Read inputs from stdin\n    int ${paramNames.join(", ")};\n    if (scanf("${paramNames.map(() => "%d").join(" ")}", ${paramNames.map(p => `&${p}`).join(", ")}) == ${paramNames.length}) {\n        printf("%d\\n", ${fnName}(${callArgs}));\n    }`;
      }

      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

/**
 * Function: ${fnName}
 * Return Type: ${retType}
 */
${retType} ${fnName}(${paramStr}) {
    // Write your solution here
    return ${defaultRet};
}

int main() {
${driverBody}
    return 0;
}`;
    }

    case "cpp": {
      const paramStr = rawParams.includes("int") || rawParams.includes("char") || rawParams.includes("string") || rawParams.includes("float") || rawParams.includes("double") || rawParams.includes("bool")
        ? rawParams
        : `int ${rawParams}`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        driverBody = `    int ${paramNames[0] || "n"};\n    if (cin >> ${paramNames[0] || "n"}) {\n        cout << ${fnName}(${paramNames[0] || "n"}) << endl;\n    }`;
      } else {
        driverBody = `    int ${paramNames.join(", ")};\n    if (cin >> ${paramNames.join(" >> ")}) {\n        cout << ${fnName}(${callArgs}) << endl;\n    }`;
      }

      return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

/**
 * Function: ${fnName}
 * Return Type: ${retType}
 */
${retType} ${fnName}(${paramStr}) {
    // Write your solution here
    return ${defaultRet};
}

int main() {
${driverBody}
    return 0;
}`;
    }

    case "java": {
      const paramStr = rawParams.includes("int") || rawParams.includes("String") || rawParams.includes("char") || rawParams.includes("double") || rawParams.includes("boolean")
        ? rawParams
        : `int ${rawParams}`;

      let driverBody = "";
      if (paramNames.length <= 1) {
        driverBody = `        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int ${paramNames[0] || "n"} = sc.nextInt();\n            System.out.println(${fnName}(${paramNames[0] || "n"}));\n        }`;
      } else {
        driverBody = `        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            ${paramNames.map(p => `int ${p} = sc.nextInt();`).join("\n            ")}\n            System.out.println(${fnName}(${callArgs}));\n        }`;
      }

      return `import java.util.*;

public class Main {
    /**
     * Function: ${fnName}
     * Return Type: ${retType}
     */
    public static ${retType} ${fnName}(${paramStr}) {
        // Write your solution here
        return ${defaultRet};
    }

    public static void main(String[] args) {
${driverBody}
    }
}`;
    }

    case "python": {
      const pyParams = normalizeParamsForLanguage(rawParams, "python");
      const pyRetType = retType === "int" ? "int" : retType === "string" || retType === "String" ? "str" : retType === "boolean" || retType === "bool" ? "bool" : retType === "float" || retType === "double" ? "float" : "any";

      let driverBody = "";
      if (paramNames.length <= 1) {
        driverBody = `    raw_input_data = sys.stdin.read().split()\n    if raw_input_data:\n        ${paramNames[0] || "n"} = int(raw_input_data[0])\n        result = ${fnName}(${paramNames[0] || "n"})\n        print(result)`;
      } else {
        driverBody = `    raw_input_data = sys.stdin.read().split()\n    if len(raw_input_data) >= ${paramNames.length}:\n        ${paramNames.map((p, idx) => `${p} = int(raw_input_data[${idx}])`).join("\n        ")}\n        result = ${fnName}(${callArgs})\n        print(result)`;
      }

      return `import sys

def ${fnName}(${pyParams}) -> ${pyRetType}:
    """
    Function: ${fnName}
    Return Type: ${pyRetType}
    """
    # Write your solution here
    return ${defaultRet}

if __name__ == "__main__":
${driverBody}`;
    }

    case "javascript": {
      const jsParams = normalizeParamsForLanguage(rawParams, "javascript");

      let driverBody = "";
      if (paramNames.length <= 1) {
        driverBody = `    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        const ${paramNames[0] || "n"} = parseInt(input, 10);\n        console.log(${fnName}(${paramNames[0] || "n"}));\n    }`;
      } else {
        driverBody = `    const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean);\n    if (tokens.length >= ${paramNames.length}) {\n        ${paramNames.map((p, idx) => `const ${p} = parseInt(tokens[${idx}], 10);`).join("\n        ")}\n        console.log(${fnName}(${callArgs}));\n    }`;
      }

      return `const fs = require('fs');

/**
 * Function: ${fnName}
 * Return Type: ${retType}
 */
function ${fnName}(${jsParams}) {
    // Write your solution here
    return ${defaultRet};
}

function main() {
${driverBody}
}

main();`;
    }

    default:
      return `// Solution Template for ${fnName}\n`;
  }
}
