import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createEditor,
  Editor as SlateEditor,
  Element as SlateElement,
  Text,
  Transforms,
} from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";
import AiFab from "../ai/AiFab";
import { htmlToText, textToEditorHtml } from "@features/ai/provider";

const ESCAPE_RE = /[&<>"]/g;
const escapeHtml = (str = "") =>
  str.replace(ESCAPE_RE, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;"
  );

const serialize = (nodes) => nodes.map(serializeNode).join("");

const serializeNode = (node) => {
  if (Text.isText(node)) {
    let str = escapeHtml(node.text);
    if (node.bold) str = `<strong>${str}</strong>`;
    if (node.italic) str = `<em>${str}</em>`;
    if (node.underline) str = `<u>${str}</u>`;
    return str;
  }
  const children = serialize(node.children);
  switch (node.type) {
    case "bulleted-list":
      return `<ul>${children}</ul>`;
    case "numbered-list":
      return `<ol>${children}</ol>`;
    case "list-item":
      return `<li>${children}</li>`;
    default:
      return `<p>${children}</p>`;
  }
};

const isHTMLElement = (n) => n && n.nodeType === 1;

const deserialize = (html = "") => {
  if (!html) return [{ type: "paragraph", children: [{ text: "" }] }];
  const body = new DOMParser().parseFromString(html, "text/html").body;
  const nodes = [...body.childNodes]
    .map(deserializeNode)
    .filter(Boolean)
    .flat();
  return nodes.length ? nodes : [{ type: "paragraph", children: [{ text: "" }] }];
};

const markChildren = (children, mark) =>
  children.map((c) => (Text.isText(c) ? { ...c, [mark]: true } : c));

const unwrapSingle = (children) =>
  children.length === 1 && children[0].type === "paragraph"
    ? children[0].children
    : children;

const deserializeNode = (el) => {
  if (!isHTMLElement(el)) {
    return { text: (el && el.textContent) || "" };
  }
  const children = [...el.childNodes].map(deserializeNode).flat();
  const plain = children.filter((c) => Text.isText(c) || c.children);
  switch (el.tagName.toLowerCase()) {
    case "p":
    case "div":
      return { type: "paragraph", children: plain };
    case "ul":
      return { type: "bulleted-list", children: plain };
    case "ol":
      return { type: "numbered-list", children: plain };
    case "li":
      return { type: "list-item", children: plain };
    case "strong":
    case "b":
      return unwrapSingle(markChildren(children, "bold"));
    case "em":
    case "i":
      return unwrapSingle(markChildren(children, "italic"));
    case "u":
      return unwrapSingle(markChildren(children, "underline"));
    case "br":
      return { text: "\n" };
    case "a":
      return children;
    default:
      return { type: "paragraph", children: plain };
  }
};

const renderElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const renderLeaf = ({ attributes, children, leaf }) => {
  let content = children;
  if (leaf.bold) content = <strong>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u>{content}</u>;
  return <span {...attributes}>{content}</span>;
};

const Toolbar = ({ onUndo, onRedo }) => {
  const editor = useSlate();
  const marks = SlateEditor.marks(editor) || {};

  const isListActive = (type) => {
    const [match] = SlateEditor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === type,
    });
    return Boolean(match);
  };

  const toggleMark = (format) => {
    if (marks[format]) SlateEditor.removeMark(editor, format);
    else SlateEditor.addMark(editor, format, true);
  };

  const toggleList = (type) => {
    const listTypes = ["bulleted-list", "numbered-list"];
    const active = isListActive(type);
    if (active) {
      Transforms.unwrapNodes(editor, {
        match: (n) => SlateElement.isElement(n) && listTypes.includes(n.type),
      });
      Transforms.setNodes(editor, { type: "paragraph" });
      return;
    }
    Transforms.wrapNodes(editor, { type, children: [] });
  };

  const clearFormatting = () => {
    Object.keys(marks).forEach((mark) => SlateEditor.removeMark(editor, mark));
  };

  const ToolButton = ({ active, title, onClick, children: icon }) => (
    <button
      type="button"
      className={`rsw-btn${active ? " active" : ""}`}
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <div className="rsw-toolbar">
      <ToolButton title="Undo" onClick={onUndo}><Undo2 size={15} /></ToolButton>
      <ToolButton title="Redo" onClick={onRedo}><Redo2 size={15} /></ToolButton>
      <span className="rsw-separator" />
      <ToolButton active={!!marks.bold} title="Bold" onClick={() => toggleMark("bold")}><Bold size={15} /></ToolButton>
      <ToolButton active={!!marks.italic} title="Italic" onClick={() => toggleMark("italic")}><Italic size={15} /></ToolButton>
      <ToolButton active={!!marks.underline} title="Underline" onClick={() => toggleMark("underline")}><Underline size={15} /></ToolButton>
      <span className="rsw-separator" />
      <ToolButton active={isListActive("bulleted-list")} title="Bulleted list" onClick={() => toggleList("bulleted-list")}><List size={15} /></ToolButton>
      <ToolButton active={isListActive("numbered-list")} title="Numbered list" onClick={() => toggleList("numbered-list")}><ListOrdered size={15} /></ToolButton>
      <span className="rsw-separator" />
      <ToolButton title="Clear formatting" onClick={clearFormatting}><Eraser size={15} /></ToolButton>
    </div>
  );
};

const EMPTY_DOC = [{ type: "paragraph", children: [{ text: "" }] }];

const RichTextEditor = ({
  value,
  onChange,
  minHeight = 240,
  placeholder = "Write here…",
  extraContext = "",
}) => {
  const editorRef = useRef(null);
  if (!editorRef.current && typeof window !== "undefined") {
    editorRef.current = withReact(createEditor());
  }
  const editor = editorRef.current;

  const valueRef = useRef(value || "");
  const [doc, setDoc] = useState(() =>
    typeof DOMParser === "undefined" ? EMPTY_DOC : deserialize(value || "")
  );
  const [docKey, setDocKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const focusedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const incoming = deserialize(value || "");
    if (serialize(incoming) === valueRef.current) return;
    if (focusedRef.current) return;
    valueRef.current = value || "";
    setDoc(incoming);
    setDocKey((k) => k + 1);
  }, [value]);

  const handleChange = useCallback(
    (next) => {
      const serialized = serialize(next);
      valueRef.current = serialized;
      const last = undoStack.current[undoStack.current.length - 1];
      if (!last || serialize(last) !== serialized) {
        undoStack.current.push(JSON.parse(JSON.stringify(next)));
        if (undoStack.current.length > 100) undoStack.current.shift();
        redoStack.current = [];
      }
      onChange(serialized);
    },
    [onChange]
  );

  const applySnapshot = (snapshot) => {
    setDoc(JSON.parse(JSON.stringify(snapshot)));
    setDocKey((k) => k + 1);
  };

  const undo = () => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(JSON.parse(JSON.stringify(editor.children)));
    applySnapshot(previous);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(JSON.parse(JSON.stringify(editor.children)));
    applySnapshot(next);
  };

  return (
    <div className="rsw-editor" style={{ "--rte-min-height": `${minHeight}px` }}>
      {mounted && editor ? (
        <Slate
          key={docKey}
          editor={editor}
          initialValue={doc}
          onChange={handleChange}
        >
          <Toolbar onUndo={undo} onRedo={redo} />
          <Editable
            className="rsw-ce"
            style={{ minHeight }}
            placeholder={placeholder}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            spellCheck
            autoCorrect="on"
            autoCapitalize="sentences"
            onFocus={() => { focusedRef.current = true; }}
            onBlur={() => { focusedRef.current = false; }}
          />
        </Slate>
      ) : (
        <div className="rsw-ce" style={{ minHeight }} />
      )}
      <AiFab
        context={htmlToText(value || "")}
        extraContext={extraContext}
        onApply={(text) => onChange(textToEditorHtml(text))}
      />
    </div>
  );
};

export default RichTextEditor;