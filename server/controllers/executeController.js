import axios from "axios";

const ONECOMPILER_URL = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

// OneCompiler uses plain language name strings, not numeric ids.
// Filenames need the right extension per language (Java needs to match
// the public class name, similar to Judge0/Piston).
const LANGUAGE_CONFIG = {
  javascript: { language: "javascript", filename: "main.js" },
  typescript: { language: "typescript", filename: "main.ts" },
  python: { language: "python", filename: "main.py" },
  cpp: { language: "cpp", filename: "main.cpp" },
  java: { language: "java", filename: "Main.java" },
  go: { language: "go", filename: "main.go" },
  rust: { language: "rust", filename: "main.rs" },
};

export async function executeCode(req, res) {
  try {
    const RAPID_API_KEY = process.env.RAPID_API_KEY?.trim();
    const RAPID_API_HOST = process.env.RAPID_API_HOST?.trim(); 

    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      return res.status(500).json({
        message: "OneCompiler environment variables are missing.",
      });
    }

    const { language, code, input } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        message: "Both language and code are required",
      });
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      return res.status(400).json({
        message: `Unsupported language: ${language}`,
      });
    }

    const response = await axios.post(
      ONECOMPILER_URL,
      {
        language: langConfig.language,
        stdin: input || "",
        files: [
          {
            name: langConfig.filename,
            content: code,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST,
        },
      }
    );

    const result = response.data;

    // OneCompiler's response: { status, exception, stdout, stderr, executionTime }
    const output = result.stdout || result.stderr || result.exception || "";

    res.status(200).json({
      success: result.status === "success" && !result.stderr && !result.exception,
      stage: "run",
      output,
      executionTime: result.executionTime,
    });
  } catch (error) {
    console.error("Error executing code:", error.response?.data || error.message);
    res.status(500).json({
      message: "Something went wrong while executing code.",
      error: error.response?.data || error.message,
    });
  }
}