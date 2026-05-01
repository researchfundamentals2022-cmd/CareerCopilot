import { GoogleGenAI } from "@google/genai";

const AI_PROVIDERS = {
  GEMINI: "gemini",
  GROQ: "groq",
};

const STORAGE_KEYS = {
  PROVIDER: "career_copilot_ai_provider",
  GEMINI_KEY: "career_copilot_gemini_key",
  GROQ_KEY: "career_copilot_groq_key",
};

const GROQ_MODEL = "llama-3.1-8b-instant";

function getGeminiClient() {
  const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);

  if (!apiKey) {
    throw new Error("Gemini API key not found. Please connect Gemini in settings.");
  }

  return new GoogleGenAI({ apiKey });
}

function getGroqConfig() {
  const apiKey = localStorage.getItem(STORAGE_KEYS.GROQ_KEY);

  if (!apiKey) {
    throw new Error("Groq API key not found. Please connect Groq in settings.");
  }

  return { apiKey };
}

export function getAIProvider() {
  return localStorage.getItem(STORAGE_KEYS.PROVIDER) || AI_PROVIDERS.GEMINI;
}

function extractText(response) {
  return (
    response?.text ||
    response?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
    ""
  ).trim();
}

function extractJSON(text) {
  if (!text) return null;
  
  // Remove possible markdown wrappers or AI chatter
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON parse failed. Text was:", text);
    return null;
  }
}

function cleanAIResponse(text) {
  if (!text) return "";
  
  // 1. Strip markdown wrappers entirely
  let cleaned = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");

  // 2. Aggressively strip "Chatty" preambles using multi-pass cleaning
  const patterns = [
    /^here (is|are|'s).*?[:\n]/im,
    /^(certainly|sure|absolutely|okay|i have|i've|i optimized|i have optimized).*?[:\n]/im,
    /^optimized (section|content|resume).*?[:\n]/im,
    /^below (is|are).*?[:\n]/im,
    /^the (following|result|updated).*?[:\n]/im,
    /^\s*result\s*[:\n]/im,
    /^"|"$|^'|'$/g, // Wrapping quotes
    /^\s*\*\s*/     // Leading asterisk lists if unnecessary
  ];

  patterns.forEach(p => {
    cleaned = cleaned.replace(p, "");
  });

  return cleaned.trim();
}

export async function runGeminiBasicTest() {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Reply with exactly this text only: GEMINI_OK",
  });

  return extractText(response);
}

export async function runGroqBasicTest(apiKey) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: "Reply with exactly this text only: GROQ_OK",
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || "Groq connection failed.");
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function interpretAIError(err) {
  const msg = (err?.message || String(err)).toLowerCase();

  if (
    msg.includes("busy") || 
    msg.includes("overloaded") || 
    msg.includes("503") || 
    msg.includes("unavailable") ||
    msg.includes("demand") ||
    msg.includes("temporary")
  ) {
    return "The AI is currently helping a lot of people at once! We tried to reach it, but it's still a bit busy. Please wait about 30-60 seconds and try again—your data is saved and safe.";
  }

  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("exhausted")) {
    return "We've reached the temporary limit for AI generations. This usually resets quickly. Please take a 30-second break and try again!";
  }

  if (msg.includes("invalid_api_key") || msg.includes("401") || msg.includes("unauthorized") || msg.includes("key not found")) {
    return "There's a small issue with the AI connection (API Key). Please check your settings or reconnect your AI key to continue.";
  }

  return "The AI brain hit a small snag! It might be a temporary connection hiccup. Please try again in a few seconds.";
}

async function callGroqAPI(prompt) {
  const { apiKey } = getGroqConfig();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer. Return ONLY the requested content. No conversational filler, no preambles, no 'Here is...', and no markdown labels. RETURN PURE CONTENT ONLY.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Status: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    throw new Error(interpretAIError(err));
  }
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function getSkillsText(skillsData = []) {
  if (!Array.isArray(skillsData)) return "";

  return skillsData
    .flatMap((group) => (Array.isArray(group?.skills) ? group.skills : []))
    .filter(Boolean)
    .join(", ");
}

function getEducationText(educationList = []) {
  if (!Array.isArray(educationList)) return "";

  return educationList
    .map((item) => {
      const degree = item?.degree || "";
      const institution = item?.institution || item?.college || "";
      const field = item?.fieldOfStudy || item?.specialization || "";
      return [degree, field, institution].filter(Boolean).join(", ");
    })
    .filter(Boolean)
    .join(" | ");
}

function getExperienceText(experienceList = []) {
  if (!Array.isArray(experienceList)) return "";

  return experienceList
    .map((item) => {
      const role = item?.role || item?.jobTitle || "";
      const company = item?.company || item?.organization || "";
      const description = item?.description || "";
      return [role, company, description].filter(Boolean).join(", ");
    })
    .filter(Boolean)
    .join(" | ");
}

function getProjectsText(projectList = []) {
  if (!Array.isArray(projectList)) return "";

  return projectList
    .map((item) => {
      const title = item?.title || "";
      const tech =
        normalizeList(item?.technologies) ||
        normalizeList(item?.techStack);
      const desc = item?.description || "";
      return [title, tech, desc].filter(Boolean).join(", ");
    })
    .filter(Boolean)
    .join(" | ");
}

function getCertificationsText(certificationList = []) {
  if (!Array.isArray(certificationList)) return "";

  return certificationList
    .map((item) => {
      const name = item?.name || item?.title || "";
      const issuer =
        item?.issuingBody || item?.issuer || item?.organization || "";
      const description = item?.description || item?.skillsCovered || "";
      return [name, issuer, description].filter(Boolean).join(", ");
    })
    .filter(Boolean)
    .join(" | ");
}

function getAchievementsText(achievementList = []) {
  if (!Array.isArray(achievementList)) return "";

  return achievementList
    .map((item) => {
      const category = item?.category || "";
      const title = item?.title || item?.name || item?.achievementTitle || "";
      const description = item?.description || "";
      return [category, title, description].filter(Boolean).join(", ");
    })
    .filter(Boolean)
    .join(" | ");
}

function buildSummaryPrompt(formData = {}, resumeData = {}) {
  const fullName = resumeData?.contact?.fullName || resumeData?.fullName || "";
  const educationList = Array.isArray(resumeData?.education) ? resumeData.education : [];
  const experienceList = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  const projectList = Array.isArray(resumeData?.projects) ? resumeData.projects : [];
  const skillsData = resumeData?.skills || [];

  const educationText = formData.education || getEducationText(educationList);
  const experienceText = getExperienceText(experienceList);
  const projectsText = getProjectsText(projectList);
  const normalizedSkills = formData.skills || getSkillsText(skillsData);

  const isFresher = !experienceText && !projectsText && !normalizedSkills;

  const STUDENT_HOOKS = [
    'Lead with academic passion (e.g., "Enthusiastic Computer Science student with a deep interest in...")',
    'Lead with fast-learning potential (e.g., "Quick learner and aspiring developer eager to apply academic knowledge to...")',
    'Lead with a specific course focus (e.g., "Focused on mastering modern web technologies and software principles at...")',
    'Lead with a project-driven curiosity (e.g., "Curious developer with a strong foundation in building experimental projects for...")',
    'Lead with a foundational skill hook (e.g., "Proficient in the fundamentals of Java and Python, with a goal to...")',
    'Lead with a "future-ready" mindset (e.g., "Ambitious student preparing for a career in technology by exploring...")',
    'Lead with a hackathon/competition angle (e.g., "Competitive programmer and hackathon enthusiast with a track record of...")',
    'Lead with an open-source contributor hook (e.g., "Active open-source contributor with a passion for community-driven software...")',
    'Lead with a self-taught developer story (e.g., "Self-taught programmer who has built a diverse portfolio of applications in...")',
    'Lead with a leadership/club role (e.g., "President of the coding club at [Institution], dedicated to fostering...")',
    'Lead with an internship-seeking goal (e.g., "Dedicated student seeking to leverage technical training in a professional...")',
    'Lead with a research-oriented focus (e.g., "Research-minded student with a focus on data analysis and theoretical...")',
    'Lead with a "bridge between tech and design" hook (e.g., "UI/UX enthusiast with strong coding fundamentals, focused on...")',
    'Lead with a mobile-first/app-dev focus (e.g., "Aspiring mobile developer with experience in building cross-platform...")',
    'Lead with a cloud/infrastructure curiosity (e.g., "Cloud enthusiast currently exploring AWS services and serverless...")',
    'Lead with a "problem-solver" narrative (e.g., "Relentless problem-solver who enjoys tackling complex algorithmic challenges in...")',
    'Lead with a "multilingual developer" angle (e.g., "Versatile student proficient in multiple languages including C++, Python, and...")',
    'Lead with an "AI/ML specialization" hook (e.g., "Aspiring ML engineer with a strong foundation in statistics and...")',
    'Lead with a "cybersecurity-aware" hook (e.g., "Security-conscious student with a growing expertise in ethical hacking and...")',
    'Lead with a "full-stack aspiration" hook (e.g., "Aspiring full-stack developer currently mastering both frontend and...")'
  ];

  const EXPERIENCED_HOOKS = [
    'Lead with a specific technical specialization (e.g., "Specializing in cloud architecture and...")',
    'Lead with an academic foundation (e.g., "Computer Science graduate from [Institution] with a focus on...")',
    'Lead with a core professional goal (e.g., "Aspiring Software Engineer focused on building scalable...")',
    'Lead with a high-impact skill set (e.g., "Proficient in Python, AWS, and Kubernetes, with a background in...")',
    'Lead with a unique combination of skill and passion (e.g., "Combining a deep understanding of frontend development with a passion for...")',
    'Lead with a problem-solving mindset (e.g., "Problem-solver dedicated to optimizing system performance and...")',
    'Lead with a focus on future technologies (e.g., "Forward-thinking developer passionate about AI and its application in...")',
    'Lead with a collaborative/team-player angle (e.g., "Collaborative engineer with a focus on agile methodologies and...")',
    'Lead with a data-driven approach (e.g., "Data-driven professional with expertise in analytics and...")',
    'Lead with a user-centric design focus (e.g., "User-centric developer focused on creating accessible and intuitive...")',
    'Lead with a research and development hook (e.g., "R&D enthusiast focused on exploring new frontiers in...")',
    'Lead with a security-first perspective (e.g., "Security-conscious engineer specializing in robust and safe...")',
    'Lead with a performance optimization hook (e.g., "Performance-focused developer specializing in low-latency and...")',
    'Lead with a "clean code" craftsmanship hook (e.g., "Clean code advocate dedicated to building maintainable and...")'
  ];

  const STRUCTURAL_JITTER = [
    "Use a formal and academic tone.",
    "Use a modern, tech-startup vibe.",
    "Focus heavily on specific tools and technologies.",
    "Focus heavily on soft skills and collaboration.",
    "Keep sentences extremely short and punchy.",
    "Use slightly more sophisticated and varied vocabulary.",
    "Emphasize the transition from student to professional.",
    "Emphasize project-based experience and practical results.",
    "Focus on potential and fast-learning capabilities.",
    "Keep the language very direct and objective."
  ];

  // ✅ SEQUENTIAL DNA SEEDING
  // We use a combination of a persistent counter and the current timestamp
  // to ensure that even simultaneous users get unique prompts.
  const varietyIndex = parseInt(localStorage.getItem('career_copilot_variety_idx') || '0');
  localStorage.setItem('career_copilot_variety_idx', (varietyIndex + 1) % 1000);
  
  const seed = Date.now() + varietyIndex;
  const activeHooks = isFresher ? STUDENT_HOOKS : EXPERIENCED_HOOKS;
  const chosenHook = activeHooks[seed % activeHooks.length];
  const chosenJitter = STRUCTURAL_JITTER[seed % STRUCTURAL_JITTER.length];

  return `
You are an expert resume writer.

Write a professional ATS-friendly resume summary for the candidate below.

Candidate details:
- Name: ${fullName || "Not provided"}
- Target Role: ${formData.targetRole || "Not provided"}
- Current Status: ${formData.currentStatus || "Not provided"}
- Education: ${educationText || "Not provided"}
- Skills: ${normalizedSkills || "Not provided"}
- Career Goal: ${formData.careerGoal || "Not provided"}
- Tone: ${formData.tone || "Professional"}
- Experience / Internships: ${experienceText || "Not provided"}
- Projects: ${projectsText || "Not provided"}

Important rules:
- Write for a resume, not for LinkedIn, SOP, or cover letter.
- Keep it ATS-friendly.
- Do not use first person words like I, me, my.
- Do not invent fake companies, fake achievements, fake metrics, or fake experience.
- If data is sparse, focus on **Aspiration**, **Potential**, and **Alignment** with the Target Role.
- Focus on role alignment, strengths, skills, projects, and career direction.
- Avoid buzzword stuffing.
- Do not use headings.
- Do not use bullet points.
- Return only the final summary text.

✅ CRITICAL RULE FOR VARIETY (GENETIC JITTER):
- DO NOT start with "Results-driven", "Results-oriented", "Highly motivated", "Dedicated", "Detail-oriented", or "Experienced".
- OPENING STRATEGY: ${chosenHook}
- STRUCTURAL STYLE: ${chosenJitter}
- Ensure the sentence structure is fresh, modern, and punchy.

Output requirements:
- Write exactly 3 distinct, high-impact sentences.
- DO NOT use the candidate's name (e.g., "${fullName}"). Jump straight into the skills and experience.
- DO NOT use placeholders like [Institution], [Company], or [Role].
- Use "Power Verbs" and keep each sentence under 25 words.
- Keep it sharp, professional, and directly usable inside a resume.
`.trim();
}

function buildProjectPrompt(formData = {}, resumeData = {}) {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const currentSummary = resumeData?.summary?.text || "";
  const educationText = getEducationText(resumeData?.education || []);

  const technologies =
    normalizeList(formData.technologies) ||
    normalizeList(formData.techStack);

  return `
You are an expert resume writer.

Write strong ATS-friendly resume content for a project description.

Candidate context:
- Education: ${educationText || "Not provided"}
- Overall Skills: ${skillsText || "Not provided"}
- Existing Summary: ${currentSummary || "Not provided"}

Project details:
- Project Title: ${formData.title || "Not provided"}
- Project Type: ${formData.projectType || "Not provided"}
- Organization / Source: ${formData.organization || "Not provided"}
- Technologies Used: ${technologies || "Not provided"}
- Role / Contribution: ${formData.role || "Not provided"}
- Problem Solved: ${formData.problemSolved || "Not provided"}
- Outcome / Result: ${formData.outcome || "Not provided"}
- Tone: ${formData.tone || "Professional"}

Important rules:
- Write for a resume, not for a project report.
- Do not use first person words like I, me, my.
- Do not invent fake metrics, fake tools, fake impact, or fake achievements.
- Keep the description realistic, polished, and recruiter-friendly.
- Naturally include important technologies.
- Focus on implementation, contribution, and outcome.
- Avoid long explanations and headings.
- Return only the final project description text.

Output requirements:
- Write 2 to 4 concise resume-ready bullet-style lines in plain text.
- Each line should be strong and specific.
- Keep the language clear, modern, and ATS-friendly.
`.trim();
}

function buildExperiencePrompt(formData = {}, resumeData = {}) {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const summaryText = resumeData?.summary?.text || "";
  const educationText = getEducationText(resumeData?.education || []);
  const projectText = getProjectsText(resumeData?.projects || []);

  return `
You are an expert resume writer.

Write strong ATS-friendly resume content for a work experience description.

Candidate context:
- Education: ${educationText || "Not provided"}
- Overall Skills: ${skillsText || "Not provided"}
- Existing Summary: ${summaryText || "Not provided"}
- Projects: ${projectText || "Not provided"}

Experience details:
- Role: ${formData.role || "Not provided"}
- Company / Organization: ${formData.company || "Not provided"}
- Employment Type: ${formData.employmentType || "Not provided"}
- Location: ${formData.cityState || "Not provided"}
- Responsibilities: ${formData.responsibilities || "Not provided"}
- Tools / Technologies Used: ${normalizeList(formData.toolsUsed) || "Not provided"}
- Outcome / Impact: ${formData.outcome || "Not provided"}
- Tone: ${formData.tone || "Professional"}

Important rules:
- Write for a resume, not for a report or cover letter.
- Do not use first person words like I, me, my.
- Do not invent fake achievements, numbers, metrics, or tools.
- Keep it realistic, polished, and recruiter-friendly.
- Focus on contribution, responsibilities, tools, ownership, and impact.
- Return only the final experience description text.

Output requirements:
- Write 2 to 4 concise resume-ready bullet-style lines in plain text.
- Start each line with a strong action verb.
- Keep it ATS-friendly, sharp, and modern.
`.trim();
}

function buildCertificationPrompt(formData = {}, resumeData = {}) {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const summaryText = resumeData?.summary?.text || "";

  return `
You are an expert resume writer.

Write strong ATS-friendly resume content for a certification description.

Candidate context:
- Overall Skills: ${skillsText || "Not provided"}
- Existing Summary: ${summaryText || "Not provided"}

Certification details:
- Certification Name: ${formData.name || "Not provided"}
- Issuing Body: ${formData.issuingBody || "Not provided"}
- Credential ID: ${formData.credentialId || "Not provided"}
- Skills Covered / Description: ${formData.skillsCovered || formData.description || "Not provided"}
- Tone: ${formData.tone || "Professional"}

Important rules:
- Write for a resume, not for a course review.
- Do not use first person words like I, me, my.
- Do not invent fake claims, fake outcomes, or fake skills.
- Keep it concise, polished, and recruiter-friendly.
- Focus on relevance, knowledge gained, and practical skill coverage.
- Return only the final certification description text.

Output requirements:
- Write 1 to 2 concise resume-ready bullet-style lines in plain text.
- Keep it ATS-friendly and clear.
`.trim();
}

function buildAchievementPrompt(formData = {}, resumeData = {}) {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const summaryText = resumeData?.summary?.text || "";

  return `
You are an expert resume writer.

Write strong ATS-friendly resume content for an achievement or activity description.

Candidate context:
- Overall Skills: ${skillsText || "Not provided"}
- Existing Summary: ${summaryText || "Not provided"}

Achievement details:
- Category: ${formData.category || "Not provided"}
- Title: ${formData.title || formData.name || "Not provided"}
- Organized By / Rank: ${formData.organizedBy || formData.rank || "Not provided"}
- Description Input: ${formData.description || "Not provided"}
- Tone: ${formData.tone || "Professional"}

Important rules:
- Write for a resume, not for a story or report.
- Do not use first person words like I, me, my.
- Do not invent fake ranks, fake awards, fake achievements, or fake metrics.
- Keep it concise, polished, and impactful.
- Focus on recognition, contribution, achievement, and relevance.
- Return only the final achievement description text.

Output requirements:
- Write 1 to 2 concise resume-ready bullet-style lines in plain text.
- Keep it ATS-friendly and impactful.
`.trim();
}

function buildCustomSectionPrompt(formData = {}, resumeData = {}, label = "") {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const summaryText = resumeData?.summary?.text || "";

  return `
You are an expert resume writer.

Write strong ATS-friendly resume content for a custom section titled "${label}".

Candidate context:
- Overall Skills: ${skillsText || "Not provided"}
- Existing Summary: ${summaryText || "Not provided"}

Entry details:
- Title: ${formData.title || "Not provided"}
- Subtitle / Context: ${formData.subtitle || "Not provided"}
- Description Input: ${formData.description || "Not provided"}
- Tone: ${formData.tone || "Professional"}

Important rules:
- Write for a resume, not for a report or personal blog.
- Do not use first person words like I, me, my.
- Do not invent fake achievements, metrics, or factual claims.
- Keep it concise, polished, and impactful.
- Focus on relevance, contribution, and clarity.
- Return only the final entry description text.

Output requirements:
- Write 1 to 2 concise resume-ready bullet-style lines in plain text.
- Keep it ATS-friendly and sharp.
`.trim();
}

function buildResumePrompt(sectionKey, userData = {}, sectionFormData = {}) {
  const normalizedSectionKey = (sectionKey || "").toLowerCase();

  if (normalizedSectionKey.startsWith("custom_")) {
    return buildCustomSectionPrompt(
      sectionFormData,
      userData,
      sectionFormData.label || sectionKey.replace("custom_", "").replace(/_/g, " ")
    );
  }

  switch (normalizedSectionKey) {
    case "summary":
      return buildSummaryPrompt(sectionFormData, userData);

    case "project":
    case "projects":
      return buildProjectPrompt(sectionFormData, userData);

    case "experience":
    case "experiences":
      return buildExperiencePrompt(sectionFormData, userData);

    case "certification":
    case "certifications":
      return buildCertificationPrompt(sectionFormData, userData);

    case "achievement":
    case "achievements":
      return buildAchievementPrompt(sectionFormData, userData);

    default:
      return `
You are an expert resume writing assistant.

Generate polished ATS-friendly resume content for the section "${sectionKey}".

Candidate data:
${JSON.stringify(userData, null, 2)}

Rules:
- Be concise
- Be truthful
- Make it resume-ready
- No explanation
- Return only final content
`.trim();
  }
}

async function withRetry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err.message || String(err)).toLowerCase();
      const isRetryable = 
        msg.includes("503") || 
        msg.includes("busy") || 
        msg.includes("overloaded") || 
        msg.includes("429") ||
        msg.includes("rate limit") ||
        msg.includes("demand") ||
        msg.includes("temporary") ||
        msg.includes("unavailable");

      if (isRetryable && i < retries - 1) {
        console.warn(`AI is busy, retrying attempt ${i + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
        continue;
      }
      throw err;
    }
  }
}

export async function generateResumeSection(
  sectionKey,
  userData = {},
  sectionFormData = {}
) {
  return await withRetry(async () => {
    const provider = getAIProvider();
    const prompt = buildResumePrompt(sectionKey, userData, sectionFormData);

    if (provider === "groq") {
      return await callGroqAPI(prompt);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      generationConfig: {
        temperature: 0.8,
      },
    });

    return cleanAIResponse(extractText(response));
  });
}

function buildKeywordGenerationPrompt(resumeData, jobDescription) {
  const skillsText = getSkillsText(resumeData?.skills || []);
  const experienceText = getExperienceText(resumeData?.experience || []);
  const projectsText = getProjectsText(resumeData?.projects || []);

  return `
You are an expert career coach and ATS optimization AI. 
Analyze the provided Target Job Description and the Candidate's Resume Profile.

1. Extract high-impact keywords required by the Job Description.
2. Cross-reference them with the Candidate's Context.
3. Separate keywords into "matched" (found in resume) and "missing" (not found, but relevant).
4. Calculate a "matchScore" from 0-100 based on keyword frequency and relevance in the resume relative to the JD.

Return the response strictly as a pure JSON object with the following structure:
{
  "skills": [
    { "category": "Languages", "matched": ["Python"], "missing": ["Go"] },
    { "category": "Frameworks", "matched": ["React"], "missing": ["Next.js"] }
  ],
  "projects": { "matched": ["KW"], "missing": ["KW"] },
  "experience": { "matched": ["KW"], "missing": ["KW"] },
  "matchScore": 75
}

Target Job Description:
${jobDescription || "Not provided"}

Candidate Context:
- Skills: ${skillsText || "Not provided"}
- Experience: ${experienceText || "Not provided"}
- Projects: ${projectsText || "Not provided"}

Important Rules:
- Return EXACTLY valid JSON.
- Max 10 keywords per category total.
- Match score should be realistic assessment of candidate's suitability for this specific job context.
`.trim();
}

export async function generateKeywords(resumeData = {}, jobDescription = "") {
  const provider = getAIProvider();
  const prompt = buildKeywordGenerationPrompt(resumeData, jobDescription);

  let rawOutput = "";
  try {
    if (provider === "groq") {
      rawOutput = await callGroqAPI(prompt);
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      rawOutput = extractText(response);
    }
  } catch (err) {
    throw new Error(interpretAIError(err));
  }

  const parsed = extractJSON(rawOutput);
  if (!parsed) {
     console.error("Failed to extract JSON from AI output:", rawOutput);
     throw new Error("AI returned invalid data format. Please try again.");
  }

  return {
    skills: parsed?.skills || { matched: [], missing: [] },
    projects: parsed?.projects || { matched: [], missing: [] },
    experience: parsed?.experience || { matched: [], missing: [] },
    matchScore: typeof parsed?.matchScore === 'number' ? parsed.matchScore : 0
  };
}

export async function generateSmartRewrite(originalText, targetKeywords = [], context = "") {
  const provider = getAIProvider();
  const prompt = `
You are an expert resume editor focusing on ULTRA-CONCISE ATS optimization.

TASK:
Optimize the SECTION below to include missing keywords.

TARGET MISSING KEYWORDS: ${targetKeywords.join(", ")}

GLOBAL CONTEXT:
${context.fullResumeText}

SECTION TO REWRITE:
"${originalText}"

STRICT RULES:
1. FORMATTING: Return ONLY the raw text bullets. NO markdown bolding (**), NO headers, NO conversational text.
2. LIMITS: Maximum 3 bullet points total.
3. BREVITY: Each bullet must be a single, high-impact sentence. 
4. VOCABULARY: Avoid repeating verbs from the GLOBAL CONTEXT. 
5. NO HALLUCINATIONS: Do not invent new company names or dates.
6. ATS: Naturally integrate keywords into sentences.
`.trim();

  let rawOutput = "";
  try {
    if (provider === "groq") {
      rawOutput = await callGroqAPI(prompt);
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      rawOutput = extractText(response);
    }
  } catch (err) {
    throw new Error(interpretAIError(err));
  }

  return cleanAIResponse(rawOutput);
}