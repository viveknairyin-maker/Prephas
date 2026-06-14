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

// Robust JSON extraction — handles cases where Gemini still adds backticks or text around JSON
const extractJson = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");
  return JSON.parse(jsonMatch[0]);
};

/**
 * 1. AI Resume Improver
 * Input: raw bullet text like "Built a college app"
 * Output: improved sentence shown inline
 */
export async function improveBulletPoint(bulletText) {
  try {
    const model = getJsonModel();
    const prompt = `Rewrite this resume bullet point to sound professional, result-oriented, and ATS-friendly. Use action verbs.
Return ONLY a valid JSON object with this structure:
{
  "improvedBullet": "the rewritten bullet point"
}
Bullet point: ${bulletText}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = extractJson(text);
    return json.improvedBullet || bulletText;
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
export async function generateSummary({ name, role, skills, experience, education, projects, achievements }) {
  try {
    const model = getJsonModel();
    const inputStr = `
Name: ${name || ""}
Target Role: ${role || ""}
Skills: ${(skills || []).join(", ")}
Experience: ${JSON.stringify(experience || [])}
Education: ${JSON.stringify(education || [])}
Projects: ${JSON.stringify(projects || [])}
Achievements: ${JSON.stringify(achievements || [])}
`;
    const prompt = `Write a 3-sentence professional resume summary for a person with this background: ${inputStr}. 
Make sure to summarize their actual experience, education, projects, achievements, and skills. 
Do not invent facts, companies, or universities that are not listed in the background data. 
If the background data is extremely sparse (e.g. empty experience or skills), write a short, clean objective statement focusing only on their target role and name, without fabricating false employment history.

Return ONLY a valid JSON object with this structure:
{
  "summary": "the 3-sentence summary text"
}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = extractJson(text);
    return json.summary || "";
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
    const model = getJsonModel();
    const prompt = `Generate 3 professional resume bullet points for someone who was a ${role} at ${company}. Use action verbs, be specific, sound ATS-friendly.
Return ONLY a valid JSON object with this structure:
{
  "bullets": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ]
}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = extractJson(text);
    return json.bullets || [];
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
    const text = result.response.text();
    return extractJson(text);
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
export const matchJobDescription = async (resumeData, jobDescription) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `
You are a resume and job description analyzer.

Compare the resume below to the job description and return ONLY a raw JSON object.
No markdown. No code fences. No explanation. No text before or after.
Start your response with { and end with }.

Return this exact structure:
{
  "matchPercent": <number 0-100>,
  "presentKeywords": ["<keyword>"],
  "missingKeywords": ["<keyword>"],
  "suggestion": "<one sentence tip>"
}

Resume:
${JSON.stringify(resumeData)}

Job Description:
${jobDescription}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Robust JSON extraction — handles cases where Gemini still adds backticks
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Extract just the JSON object in case there's stray text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
};

/**
 * 6. Parse Resume from Raw Text
 * Input: raw extracted resume text
 * Output: structured resume JSON object
 */
export async function parseResumeFromText(rawText) {
  try {
    const model = getJsonModel();
    const prompt = `Analyze this raw resume text and extract the information into a structured JSON object matching this exact schema:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string",
    "role": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "bullets": [ "string" ]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "skills": [ "string" ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "link": "string"
    }
  ],
  "achievements": [ "string" ],
  "certifications": [
    {
      "name": "string",
      "authority": "string",
      "year": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "string"
    }
  ],
  "links": {
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "leetcode": "string"
  }
}
Note: If a section is missing, return an empty array [] or empty object as appropriate.
Do not fabricate information. Extract only what is present in the text.
Raw text:
"""
${rawText}
"""`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJson(text);
  } catch (error) {
    console.error("Error in parseResumeFromText:", error);
    throw error;
  }
}

/**
 * 7. Job Description Match Analyzer
 * Input: resume text/JSON + pasted job description text
 * Output: match score, status, strengths, missing keywords, and improvements
 */
export async function calculateJobMatchScore(resumeTextOrJson, jobDescriptionText) {
  try {
    const model = getJsonModel();
    const resumeStr = typeof resumeTextOrJson === 'object' ? JSON.stringify(resumeTextOrJson, null, 2) : resumeTextOrJson;
    const prompt = `You are an expert recruiter and ATS matching system.
Analyze the following resume (which could be plain text or JSON format) and compare it against the provided Job Description.

Calculate a realistic match score (0-100) based on:
1. Skills and Technologies (are the required tools/languages/frameworks present?)
2. Experience (does the candidate have relevant work history and job titles?)
3. Education and Certifications (are degrees and credentials matching requirements?)
4. Projects and Industry keywords.

Determine the Match Status based on the calculated score:
- "Excellent Match" (score 85-100): The candidate meets almost all key criteria and preferences.
- "Strong Match" (score 70-84): The candidate has most core skills and experience, but lacks minor details.
- "Moderate Match" (score 50-69): The candidate has some relevant skills/experience, but there are substantial gaps.
- "Weak Match" (score 0-49): The candidate does not meet the core requirements.

Identify:
- "strengths": Keywords, skills, experiences, and titles that successfully match.
- "missingKeywords": Key skills, tools, methodologies, certifications, or titles present in the job description but missing/weak in the resume.
- "improvements": Actionable, concrete recommendations on what specific sections of the resume need updates or additions (e.g. "Add specific projects showing Experience with Kubernetes", "List your certification in AWS", "Ensure your job title matches or aligns closer to Software Engineer").

Return ONLY a valid JSON object with the following structure, no markdown, no explanation, no code fences:
{
  "score": number,
  "status": "Excellent Match" | "Strong Match" | "Moderate Match" | "Weak Match",
  "strengths": [ "string" ],
  "missingKeywords": [ "string" ],
  "improvements": [ "string" ]
}

Resume Data:
${resumeStr}

Job Description:
${jobDescriptionText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJson(text);
  } catch (error) {
    console.error("Error in calculateJobMatchScore:", error);
    throw error;
  }
}
