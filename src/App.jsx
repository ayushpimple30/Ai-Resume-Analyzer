import React, { useState } from "react";
import {
  Briefcase,
  FileText,
  Cpu,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* ================= GEMINI API ================= */
const apiKey = "Your Api Key"; // 🔴 ADD YOUR KEY

const callGemini = async (prompt) => {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated."
    );
  } catch {
    return "Gemini API error.";
  }
};

/* ================= ATS ANALYSIS ================= */
const SKILLS = [
  "react",
  "javascript",
  "typescript",
  "tailwind",
  "node",
  "aws",
  "docker",
  "ci/cd",
  "python",
  "sql",
];

const analyzeText = (resume, job) => {
  const r = resume.toLowerCase();
  const j = job.toLowerCase();

  const matched = SKILLS.filter((s) => r.includes(s) && j.includes(s));
  const missing = SKILLS.filter((s) => j.includes(s) && !r.includes(s));

  const score = Math.round(
    (matched.length / Math.max(1, matched.length + missing.length)) * 100
  );

  return { matched, missing, score };
};

/* ================= APP ================= */
export default function App() {
  const [view, setView] = useState("input");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [results, setResults] = useState(null);

  const [aiMode, setAiMode] = useState(null);
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const loadDemoData = () => {
    setResumeText(
      `Frontend Developer with 4+ years experience.
Skills: React, JavaScript, HTML, CSS, Tailwind, Git.
Improved performance by 30% and built scalable UI systems.`
    );

    setJobText(
      `Senior Frontend Engineer
Requirements:
- React
- JavaScript
- TypeScript
- Tailwind CSS
- AWS
- CI/CD
- Strong communication`
    );
  };

  const handleAnalyze = () => {
    setView("processing");
    setTimeout(() => {
      setResults(analyzeText(resumeText, jobText));
      setView("results");
    }, 1200);
  };

  const handleAiAction = async (mode) => {
    setAiMode(mode);
    setAiLoading(true);
    setAiContent("");

    const context = `
Resume:
${resumeText}

Job Description:
${jobText}
`;

    const prompts = {
      gap: "Analyze resume gaps vs job description.",
      summary: "Rewrite professional summary tailored to JD.",
      cover: "Write a modern tailored cover letter.",
      salary: "Estimate salary range and negotiation tips.",
      refine: "Improve resume bullets using STAR method.",
      network: "Write LinkedIn connection & recruiter message.",
      upskill: "Create 4-week upskill plan for missing skills.",
      linkedin: "Optimize LinkedIn headline & About section.",
      scorecard: "Give 360-degree resume scorecard with GPA.",
      interview: "Generate technical & behavioral questions.",
    };

    const text = await callGemini(prompts[mode] + context);
    setAiContent(text);
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded">
            <Cpu className="text-white" />
          </div>
          <h1 className="font-bold text-xl">ResumeAI</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-sm">Sign In</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
            Sign Up
          </button>
        </div>
      </header>

      {/* INPUT VIEW */}
      {view === "input" && (
        <main className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <textarea
              className="h-72 p-4 border rounded"
              placeholder="Paste Resume..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <textarea
              className="h-72 p-4 border rounded"
              placeholder="Paste Job Description..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </div>

          <div className="text-center mt-6 space-y-3">
            <button
              onClick={handleAnalyze}
              disabled={!resumeText || !jobText}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold"
            >
              Analyze Resume
            </button>
            <div>
              <button
                onClick={loadDemoData}
                className="text-blue-600 underline text-sm"
              >
                Load Demo Resume
              </button>
            </div>
          </div>
        </main>
      )}

      {/* PROCESSING */}
      {view === "processing" && (
        <div className="flex justify-center items-center h-[60vh]">
          <Activity className="animate-spin text-blue-600" size={40} />
        </div>
      )}

      {/* RESULTS */}
      {view === "results" && results && (
        <main className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-6">
            Match Score: {results.score}%
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Matched Skills
              </h3>
              {results.matched.map((s) => (
                <span
                  key={s}
                  className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded m-1"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <XCircle className="text-red-600" /> Missing Keywords
              </h3>
              {results.missing.map((s) => (
                <span
                  key={s}
                  className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded m-1"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* AI CAREER CONSULTANT */}
          <h3 className="text-2xl font-bold mt-10 mb-4">
            AI Career Consultant
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "gap",
              "summary",
              "cover",
              "salary",
              "refine",
              "network",
              "upskill",
              "linkedin",
              "scorecard",
              "interview",
            ].map((tool) => (
              <button
                key={tool}
                onClick={() => handleAiAction(tool)}
                className="border rounded-lg p-4 font-semibold hover:bg-slate-100"
              >
                {tool.toUpperCase()}
              </button>
            ))}
          </div>

          {(aiMode || aiLoading) && (
            <div className="bg-white border rounded-xl p-6 mt-6">
              {aiLoading ? (
                <p className="animate-pulse">AI is thinking...</p>
              ) : (
                <pre className="whitespace-pre-wrap text-sm">
                  {aiContent}
                </pre>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
