import Submission from "../models/Submission.js";

/**
 * Tokenizes source code into normalized token sequences.
 * Strips comments, whitespace, literal values, and standardizes variable identifiers.
 */
function tokenizeCode(code) {
  if (!code) return [];
  
  // Strip comments
  let clean = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
  // Strip strings and numbers
  clean = clean.replace(/"[^"]*"|'[^']*'/g, "STR").replace(/\b\d+\b/g, "NUM");
  // Normalize keywords and symbols into token sequence
  const tokens = clean
    .split(/[\s,;(){}\[\]+\-*\/%!=&|<>.]+/)
    .filter((t) => t.length > 0);
  
  return tokens;
}

/**
 * Generates N-grams from a token array.
 */
function generateNGrams(tokens, n = 3) {
  const nGrams = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    nGrams.add(tokens.slice(i, i + n).join("_"));
  }
  return nGrams;
}

/**
 * Calculates Jaccard Similarity between two sets of N-grams.
 */
function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 100;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return Math.round((intersectionCount / unionCount) * 100);
}

/**
 * Analyzes code against all existing submissions for the same assignment to detect plagiarism.
 */
export const checkPlagiarism = async (assignmentId, currentStudentId, code) => {
  try {
    const previousSubmissions = await Submission.find({
      assignment: assignmentId,
      student: { $ne: currentStudentId },
    }).populate("student", "name rollNo email");

    if (!previousSubmissions || previousSubmissions.length === 0) {
      return {
        similarityScore: 0,
        flagged: false,
        matchedSubmission: null,
        matchedStudentName: "",
        matchedCodeSnippet: "",
      };
    }

    const currentTokens = tokenizeCode(code);
    const currentNGrams = generateNGrams(currentTokens, 3);

    let maxSimilarity = 0;
    let mostSimilarSubmission = null;

    for (const prevSub of previousSubmissions) {
      const prevTokens = tokenizeCode(prevSub.code);
      const prevNGrams = generateNGrams(prevTokens, 3);

      const similarity = calculateJaccardSimilarity(currentNGrams, prevNGrams);

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilarSubmission = prevSub;
      }
    }

    const flagged = maxSimilarity >= 50; // Flag if 50% or higher similarity

    return {
      similarityScore: maxSimilarity,
      flagged,
      matchedSubmission: mostSimilarSubmission ? mostSimilarSubmission._id : null,
      matchedStudentName: mostSimilarSubmission?.student?.name || "Peer Student",
      matchedCodeSnippet: mostSimilarSubmission ? mostSimilarSubmission.code.substring(0, 250) + "..." : "",
    };
  } catch (err) {
    console.error("Plagiarism check error:", err);
    return {
      similarityScore: 0,
      flagged: false,
      matchedSubmission: null,
      matchedStudentName: "",
      matchedCodeSnippet: "",
    };
  }
};
