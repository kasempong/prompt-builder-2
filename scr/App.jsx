import { useState, useEffect } from "react";

const ROLES = [
  { id: "engineer", label: "AI Engineer", icon: "⚙️", color: "#00ff9d" },
  { id: "researcher", label: "Research Analyst", icon: "🔬", color: "#00cfff" },
  { id: "strategist", label: "Business Strategist", icon: "📊", color: "#ff9d00" },
  { id: "writer", label: "Senior Writer", icon: "✍️", color: "#ff5fcb" },
  { id: "tutor", label: "Expert Tutor", icon: "🧠", color: "#b48aff" },
  { id: "critic", label: "Devil's Advocate", icon: "⚡", color: "#ff4747" },
];

const PURPOSES = [
  "Explain a concept clearly",
  "Research a topic in depth",
  "Solve a technical problem",
  "Generate creative ideas",
  "Review and critique my work",
  "Build or code something",
  "Summarize and synthesize info",
  "Compare options / make a decision",
];

const FORMATS = ["Step-by-step breakdown", "Bullet points", "Detailed essay", "Table / comparison", "Code with explanation", "Short & direct answer"];

const INITIAL_SAVED = [
  {
    id: 1,
    title: "Prompt Template Builder",
    date: "2026-03-04",
    tag: "meta",
    tagColor: "#00ff9d",
    prompt: `🎭 ROLE:\nAct as an AI Engineer\n\n🎯 TASK:\nI want to template how to prompt properly — when I want to do or research about something. Show me how to structure prompts: what role to assign, what the purpose of prompting is, and how to ask for what I want effectively.`,
    raw: "Act as AI engineer, I want to template how to prompt properly when I want to do or research about something like you would — what role, what's the purpose of prompting something like that.",
  },
];

const TEMPLATE_PARTS = [
  {
    key: "role",
    label: "① Role",
    color: "#00ff9d",
    placeholder: "e.g. Act as a Senior AI Engineer with expertise in LLMs",
    tip: "Tell Claude WHO to be. The role shapes tone, depth, and vocabulary.",
    example: "Act as a Senior AI Engineer specializing in production LLM systems.",
  },
  {
    key: "context",
    label: "② Context",
    color: "#00cfff",
    placeholder: "e.g. I'm building a chatbot for a fintech startup, using GPT-4...",
    tip: "Give Claude YOUR situation. The more specific, the better the answer.",
    example: "I'm a solo developer building a customer support chatbot. My users are non-technical.",
  },
  {
    key: "task",
    label: "③ Task / Goal",
    color: "#ff9d00",
    placeholder: "e.g. Help me choose the best vector database for my use case",
    tip: "State clearly what you want done or answered.",
    example: "Help me decide between Pinecone, Weaviate, and Chroma for semantic search.",
  },
  {
    key: "constraints",
    label: "④ Constraints",
    color: "#ff5fcb",
    placeholder: "e.g. Budget is under $100/month, must be open-source friendly",
    tip: "Set your boundaries — budget, tech stack, time, audience level, etc.",
    example: "Keep it under $50/mo, must have a free tier, and I need good Python support.",
  },
  {
    key: "format",
    label: "⑤ Output Format",
    color: "#b48aff",
    placeholder: "e.g. Give me a comparison table, then a final recommendation",
    tip: "Tell Claude how you want the answer — list, table, code, short/long.",
    example: "Give me a 3-column comparison table, then a TL;DR recommendation at the end.",
  },
];

const TAG_OPTIONS = [
  { label: "general", color: "#888" },
  { label: "research", color: "#00cfff" },
  { label: "coding", color: "#00ff9d" },
  { label: "writing", color: "#ff5fcb" },
  { label: "strategy", color: "#ff9d00" },
  { label: "meta", color: "#b48aff" },
];

export default function PromptTemplateGuide() {
  const [form, setForm] = useState({ role: "", context: "", task: "", constraints: "", format: "" });
  const [selectedRole, setSelectedRole] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveTag, setSaveTag] = useState("general");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load from localStorage on mount
  const [saved, setSaved] = useState(() => {
    try {
      const stored = localStorage.getItem("prompt-builder-saved");
      return stored ? JSON.parse(stored) : INITIAL_SAVED;
    } catch {
      return INITIAL_SAVED;
    }
  });

  // Persist to localStorage whenever saved changes
  useEffect(() => {
    try {
      localStorage.setItem("prompt-builder-saved", JSON.stringify(saved));
    } catch {}
  }, [saved]);

  const handleSavePrompt = () => {
    const text = generatePrompt();
    if (!text.trim() || !saveTitle.trim()) return;
    const tag = TAG_OPTIONS.find(t => t.label === saveTag);
    setSaved(prev => [{
      id: Date.now(),
      title: saveTitle,
      date: new Date().toISOString().split("T")[0],
      tag: saveTag,
      tagColor: tag?.color || "#888",
      prompt: text,
      raw: "",
    }, ...prev]);
    setSaveTitle("");
    setShowSaveForm(false);
  };

  const handleDeleteSaved = (id) => setSaved(prev => prev.filter(s => s.id !== id));

  const handleLoadSaved = (s) => {
    const lines = s.prompt.split("\n\n");
    const extract = (label) => {
      const block = lines.find(l => l.startsWith(label));
      return block ? block.replace(label + "\n", "").trim() : "";
    };
    setForm({
      role: extract("🎭 ROLE:"),
      context: extract("📌 CONTEXT:"),
      task: extract("🎯 TASK:"),
      constraints: extract("🔒 CONSTRAINTS:"),
      format: extract("📋 OUTPUT FORMAT:"),
    });
    setActiveTab("builder");
  };

  const handleCopySaved = (s) => {
    navigator.clipboard.writeText(s.prompt);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    handleChange("role", `Act as a ${role.label} with deep expertise in this domain.`);
  };

  const generatePrompt = () => {
    const parts = [
      form.role && `🎭 ROLE:\n${form.role}`,
      form.context && `📌 CONTEXT:\n${form.context}`,
      form.task && `🎯 TASK:\n${form.task}`,
      form.constraints && `🔒 CONSTRAINTS:\n${form.constraints}`,
      form.format && `📋 OUTPUT FORMAT:\n${form.format}`,
    ].filter(Boolean);
    return parts.join("\n\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptReady = Object.values(form).some((v) => v.trim());

  return (
    <div style={{ fontFamily: "'Courier New', monospace", background: "#0a0a0f", minHeight: "100vh", color: "#e0e0e0", padding: "24px 16px" }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea, input { background: #111118; border: 1px solid #2a2a3a; color: #e0e0e0; font-family: 'Courier New', monospace; font-size: 13px; border-radius: 6px; padding: 10px 12px; width: 100%; resize: vertical; outline: none; transition: border 0.2s; }
        textarea:focus, input:focus { border-color: #00ff9d; }
        .tab { padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #2a2a3a; transition: all 0.2s; background: transparent; }
        .tab.active { background: #00ff9d !important; color: #0a0a0f !important; border-color: #00ff9d; font-weight: bold; }
        .role-chip { padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; border: 1px solid #2a2a3a; transition: all 0.2s; display: flex; align-items: center; gap: 6px; background: transparent; }
        .role-chip:hover { transform: translateY(-1px); }
        .copy-btn { padding: 12px 28px; border-radius: 8px; cursor: pointer; font-size: 13px; letter-spacing: 1px; border: none; font-family: 'Courier New', monospace; font-weight: bold; transition: all 0.2s; }
        .copy-btn:hover { transform: translateY(-1px); }
        .example-tag { font-size: 10px; color: #555; margin-top: 4px; cursor: pointer; }
        .example-tag:hover { color: #00ff9d; }
        .prompt-output { background: #0d0d15; border: 1px solid #2a2a3a; border-radius: 10px; padding: 20px; white-space: pre-wrap; font-size: 13px; line-height: 1.7; min-height: 120px; color: #c8c8d8; }
      `}</style>

      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontSize: 11, color: "#00ff9d", letterSpacing: 3, textTransform: "uppercase" }}>
          // AI PROMPTING FRAMEWORK
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: "bold", color: "#fff", letterSpacing: -1 }}>
          Prompt Template Builder
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "#555" }}>
          Structure your AI prompts like an engineer. Role → Context → Task → Constraints → Format.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["builder", "saved", "reference"].map((t) => (
            <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ color: activeTab === t ? "#0a0a0f" : "#666" }}>
              {t === "builder" ? "🛠 Builder" : t === "saved" ? `📁 Saved (${saved.length})` : "📖 Reference"}
            </button>
          ))}
        </div>

        {activeTab === "builder" && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Quick Role Select</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map((r) => (
                  <button key={r.id} className="role-chip" onClick={() => handleRoleSelect(r)}
                    style={{ background: selectedRole === r.id ? r.color + "22" : "transparent", borderColor: selectedRole === r.id ? r.color : "#2a2a3a", color: selectedRole === r.id ? r.color : "#888" }}>
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>

            {TEMPLATE_PARTS.map((part) => (
              <div key={part.key} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: part.color, letterSpacing: 1, fontWeight: "bold" }}>{part.label}</label>
                  <span style={{ fontSize: 10, color: "#333" }}>{part.tip}</span>
                </div>
                <textarea rows={part.key === "task" ? 3 : 2} placeholder={part.placeholder} value={form[part.key]} onChange={(e) => handleChange(part.key, e.target.value)} />
                <div className="example-tag" onClick={() => handleChange(part.key, part.example)}>
                  ↳ Use example: "{part.example.slice(0, 55)}..."
                </div>
              </div>
            ))}

            {promptReady && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Generated Prompt</div>
                <div className="prompt-output">{generatePrompt()}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="copy-btn" onClick={handleCopy} style={{ background: copied ? "#00ff9d" : "#111118", color: copied ? "#0a0a0f" : "#00ff9d", border: "1px solid #00ff9d" }}>
                    {copied ? "✓ COPIED!" : "⎘ COPY PROMPT"}
                  </button>
                  <button className="copy-btn" onClick={() => setShowSaveForm(v => !v)} style={{ background: "transparent", color: "#b48aff", border: "1px solid #b48aff" }}>
                    {showSaveForm ? "✕ Cancel" : "＋ SAVE PROMPT"}
                  </button>
                </div>
                {showSaveForm && (
                  <div style={{ marginTop: 12, padding: 16, background: "#0d0d15", borderRadius: 8, border: "1px solid #2a2a3a" }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: 1 }}>SAVE AS</div>
                    <input placeholder="Prompt title (e.g. 'Explain React Hooks')" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} style={{ marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {TAG_OPTIONS.map(t => (
                        <button key={t.label} onClick={() => setSaveTag(t.label)} style={{ padding: "4px 10px", border: `1px solid ${saveTag === t.label ? t.color : "#2a2a3a"}`, borderRadius: 20, background: saveTag === t.label ? t.color + "22" : "transparent", color: saveTag === t.label ? t.color : "#555", fontSize: 11, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <button className="copy-btn" onClick={handleSavePrompt} style={{ background: "#b48aff", color: "#0a0a0f", border: "none" }}>SAVE →</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "saved" && (
          <div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>Your Saved Prompts</div>
            {saved.length === 0 && (
              <div style={{ color: "#333", fontSize: 13, padding: 24, textAlign: "center", border: "1px dashed #2a2a3a", borderRadius: 8 }}>
                No saved prompts yet. Build one in the Builder tab and save it.
              </div>
            )}
            {saved.map(s => (
              <div key={s.id} style={{ marginBottom: 14, background: "#0d0d15", border: "1px solid #2a2a3a", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.tagColor, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ color: "#ddd", fontSize: 13, fontWeight: "bold" }}>{s.title}</span>
                    <span style={{ color: s.tagColor, fontSize: 10, padding: "2px 8px", border: `1px solid ${s.tagColor}33`, borderRadius: 20 }}>{s.tag}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: "#333", fontSize: 10 }}>{s.date}</span>
                    <span style={{ color: "#444", fontSize: 14 }}>{expandedId === s.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expandedId === s.id && (
                  <div style={{ padding: "0 16px 16px" }}>
                    {s.raw && (
                      <div style={{ marginBottom: 10, padding: "8px 12px", background: "#111118", borderRadius: 6, fontSize: 11, color: "#555", borderLeft: "2px solid #333" }}>
                        <span style={{ color: "#444" }}>original message: </span>{s.raw}
                      </div>
                    )}
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#aaa", lineHeight: 1.7, padding: "12px", background: "#111118", borderRadius: 6, marginBottom: 12 }}>
                      {s.prompt}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="copy-btn" onClick={() => handleCopySaved(s)} style={{ fontSize: 11, padding: "8px 16px", background: copiedId === s.id ? "#00ff9d" : "transparent", color: copiedId === s.id ? "#0a0a0f" : "#00ff9d", border: "1px solid #00ff9d" }}>
                        {copiedId === s.id ? "✓ Copied" : "⎘ Copy"}
                      </button>
                      <button className="copy-btn" onClick={() => handleLoadSaved(s)} style={{ fontSize: 11, padding: "8px 16px", background: "transparent", color: "#b48aff", border: "1px solid #b48aff" }}>
                        ↺ Load into Builder
                      </button>
                      <button className="copy-btn" onClick={() => handleDeleteSaved(s.id)} style={{ fontSize: 11, padding: "8px 16px", background: "transparent", color: "#ff4747", border: "1px solid #ff474733" }}>
                        ✕ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "reference" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>The 5-Part Framework</div>
              {TEMPLATE_PARTS.map((p) => (
                <div key={p.key} style={{ marginBottom: 16, padding: 16, background: "#0d0d15", borderRadius: 8, borderLeft: `3px solid ${p.color}` }}>
                  <div style={{ color: p.color, fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>{p.tip}</div>
                  <div style={{ color: "#555", fontSize: 11, fontStyle: "italic" }}>→ {p.example}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Common Purposes</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PURPOSES.map((p) => (
                  <span key={p} style={{ padding: "6px 12px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6, fontSize: 12, color: "#777" }}>{p}</span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Output Format Options</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FORMATS.map((f) => (
                  <span key={f} style={{ padding: "6px 12px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6, fontSize: 12, color: "#b48aff" }}>{f}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Golden Rules</div>
              {[
                ["Be specific, not vague", "\"Explain React hooks for a junior dev\" > \"Explain React\""],
                ["Assign a role always", "\"Act as a...\" changes the entire quality of response"],
                ["Give context about yourself", "Your level, goal, and constraints shape the answer"],
                ["State the format explicitly", "Ask for tables, steps, or summaries — don't leave it to chance"],
                ["Iterate, don't restart", "Build on Claude's response: \"Now make it shorter / more technical\""],
              ].map(([rule, sub]) => (
                <div key={rule} style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "#00ff9d", fontSize: 14, marginTop: 1 }}>▸</span>
                  <div>
                    <div style={{ color: "#ddd", fontSize: 13 }}>{rule}</div>
                    <div style={{ color: "#555", fontSize: 11 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
