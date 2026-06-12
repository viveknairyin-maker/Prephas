import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API Client
const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("Gemini API key is not configured. Please add it to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

const getJsonModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("Gemini API key is not configured. Please add it to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
};

/**
 * 1. AI Resume Improver
 * Input: raw bullet text like "Built a college app"
 * Output: improved sentence shown inline
 */
export async function improveBulletPoint(bulletText) {
  try {
    const model = getModel();
    const prompt = `Rewrite this resume bullet point to sound professional, result-oriented, and ATS-friendly. Use action verbs. Return only the improved sentence, nothing else: ${bulletText}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in improveBulletPoint:", error);
    throw error;
  }
}

/**
 * 2. AI Summary Generator
 * Input: user's name, role, skills, experience entries
 * Output: fills the summary textarea
 */
export async function generateSummary({ name, role, skills, experience }) {
  try {
    const model = getModel();
    const inputStr = `Name: ${name || ""}, Target Role: ${role || ""}, Skills: ${(skills || []).join(", ")}, Experience: ${JSON.stringify(experience || [])}`;
    const prompt = `Write a 3-sentence professional resume summary for a person with this background: ${inputStr}. Keep it concise, ATS-friendly, first person avoided. Return only the summary.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateSummary:", error);
    throw error;
  }
}

/**
 * 3. AI Bullet Point Generator
 * Input: just a role/company like "Intern at LettrBlack"
 * Output: 3 bullets inserted into the experience block
 */
export async function generateBulletPoints(role, company) {
  try {
    const model = getModel();
    const prompt = `Generate 3 professional resume bullet points for someone who was a ${role} at ${company}. Use action verbs, be specific, sound ATS-friendly. Return only 3 bullet points, each on a new line starting with •`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Parse the lines and clean them
    return text
      .split("\n")
      .map(line => line.replace(/^•\s*/, "").trim())
      .filter(line => line.length > 0)
      .slice(0, 3);
  } catch (error) {
    console.error("Error in generateBulletPoints:", error);
    throw error;
  }
}

/**
 * 4. ATS Score Calculator
 * Input: entire resume as JSON stringified
 * Output: parsed and displayed on ATS Score page
 */
export async function calculateAtsScore(resumeJson) {
  try {
    const model = getJsonModel();
    const prompt = `Analyze this resume JSON and return ONLY a valid JSON object with this exact structure:
{
  "score": number between 0-100,
  "issues": [ "string" ],
  "positives": [ "string" ]
}
Check for: summary presence, skills quantity, contact completeness, bullet point quality, measurable achievements, proper sections.
Resume JSON: ${resumeJson}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in calculateAtsScore:", error);
    throw error;
  }
}

/**
 * 5. Job Description Matcher
 * Input: resume JSON + pasted job description text
 * Output: displayed on Job Match page
 */
export async function matchJobDescription(resumeJson, jobDescriptionText) {
  try {
    const model = getJsonModel();
    const prompt = `Compare this resume to this job description. Return ONLY a valid JSON object:
{
  "matchPercent": number,
  "missingKeywords": [ "string" ],
  "presentKeywords": [ "string" ]
}
Resume: ${resumeJson}
Job Description: ${jobDescriptionText}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in matchJobDescription:", error);
    throw error;
  }
}
