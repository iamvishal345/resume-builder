import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Sparkles, Settings2, Loader2 } from "lucide-react";
import { aiGenerate, isAiAvailable } from "@features/ai/provider";

const IMPROVE_SYSTEM =
  "You are a professional resume editor. Improve the given text: fix grammar, spelling and clumsy phrasing, tighten the wording, and keep the exact meaning. Only use facts present in the input; never invent anything. Respond as plain text: separate paragraphs with a blank line, or use '- ' bullets when a short list is clearer.";

const REWRITE_SYSTEM =
  "You are a professional resume editor. Completely rewrite the given text from scratch: make it concise, strong and achievement-oriented. Only use facts present in the input; never invent anything. Respond as plain text: separate paragraphs with a blank line, or use '- ' bullets when a list of achievements is clearer.";

const BULLET_SYSTEM =
  "You are a professional resume editor. Rewrite each achievement as a strong resume bullet. Start every line with an action verb. Prefer measurable outcomes when numbers already appear in the input; never invent metrics, employers, or tools. Respond ONLY as a plain list of lines each starting with '- '. Keep one idea per bullet.";

const toneSystem = (tone) =>
  `You are a professional resume editor. Rewrite the given text in a ${tone} tone. Keep the meaning and all facts exactly as given; never invent anything. Respond as plain text: separate paragraphs with a blank line, or use '- ' bullets when a short list is clearer.`;

const ACTIONS = [
  { id: "improve", label: "Improve", hint: "Polish wording & fix grammar", system: IMPROVE_SYSTEM },
  { id: "bullets", label: "Polish as bullets", hint: "Action verbs, one idea each", system: BULLET_SYSTEM },
  { id: "rewrite", label: "Rewrite completely", hint: "Fresh, punchier version", system: REWRITE_SYSTEM },
  { id: "professional", label: "Professional tone", hint: "Formal, corporate voice", system: toneSystem("professional") },
  { id: "confident", label: "Confident tone", hint: "Bold, assertive voice", system: toneSystem("confident") },
  { id: "concise", label: "Concise tone", hint: "Short & scannable", system: toneSystem("concise, to the point") },
];

const AiFab = ({ context = "", extraContext = "", onApply }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const wrapRef = useRef(null);
  const available = isAiAvailable();

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const buildUser = (action) => {
    const snippets = [];
    if (extraContext.trim()) snippets.push(`Context about the candidate:\n${extraContext.trim()}`);
    if (context.trim()) snippets.push(`Existing text:\n${context.trim()}`);
    if (!snippets.length) snippets.push("Write a short, professional resume text for this section.");
    return snippets.join("\n\n");
  };

  const run = async (action) => {
    setStatus("");
    if (!available) return;
    setOpen(true);
    setLoading(true);
    try {
      const text = await aiGenerate({ system: action.system, user: buildUser(action) });
      onApply(text);
      setOpen(false);
    } catch (err) {
      setStatus((err && err.message) || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`ai-fab-wrap${open ? " open" : ""}`}
      aria-label="AI writing tools"
    >
      {available ? (
        <IconButton
          label="AI writing tools"
          tooltip="AI writing tools"
          variant="primary"
          isDisabled={loading}
          icon={loading ? <Loader2 size={18} className="ai-fab-spin" /> : <Sparkles size={18} />}
          onClick={() => setOpen((current) => !current)}
        />
      ) : (
        <IconButton
          label="Set preferences to enable AI"
          tooltip="Set preferences to enable AI"
          variant="secondary"
          icon={<Sparkles size={18} />}
          isDisabled
          onClick={() => {}}
        />
      )}
      <div className="ai-fab-pop" role="menu">
        {!available ? (
          <div className="ai-fab-disabled">
            <Settings2 size={14} />
            <span>Set preferences to enable AI</span>
          </div>
        ) : (
          <>
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className="ai-fab-item"
                disabled={loading}
                onClick={() => run(action)}
              >
                <span className="ai-fab-item-label">{action.label}</span>
                <span className="ai-fab-item-hint">{action.hint}</span>
              </button>
            ))}
            {loading ? (
              <div className="ai-fab-footer">
                <Loader2 size={13} className="ai-fab-spin" /> Thinking…
              </div>
            ) : null}
            {status ? <div className="ai-fab-error">{status}</div> : null}
          </>
        )}
      </div>
    </div>
  );
};

export default AiFab;