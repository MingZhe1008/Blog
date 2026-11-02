"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { Editor, TextMarker } from "codemirror";
import { getMarkdownImages } from "@/lib/markdown-images";
import { uploadImageFile } from "@/server-actions/upload";
import "codemirror/lib/codemirror.css";
import { markdownEdit, type MarkdownCommand } from "@/lib/markdown-formatting";
import { Bold, Italic, Underline, Strikethrough, Code, Code2, Quote, List, ListOrdered, ListTodo, Link, Minus, Table, Undo2, Redo2 } from "lucide-react";

export interface MarkdownImageEditorHandle { insertImage: (url: string) => void }

export const MarkdownImageEditor = forwardRef<MarkdownImageEditorHandle, {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}>(function MarkdownImageEditor({ value, onChange, placeholder, disabled = false, id }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Editor | null>(null);
  const callbacks = useRef({ onChange, disabled, value });
  callbacks.current = { onChange, disabled, value };
  const [sourceMode, setSourceMode] = useState(false);
  const sourceModeRef = useRef(false);
  const redraw = useRef<() => void>(() => {});
  const uploadBusy = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [headingLevel, setHeadingLevel] = useState(0);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const en = useLocale() === "en";
  const language = useRef(en);
  language.current = en;

  function format(command: MarkdownCommand | "undo" | "redo") {
    const cm = editor.current;
    if (!cm || callbacks.current.disabled) return;
    if (command === "undo") cm.undo();
    else if (command === "redo") cm.redo();
    else {
      const change = markdownEdit(cm.getValue(), cm.indexFromPos(cm.getCursor("from")), cm.indexFromPos(cm.getCursor("to")), command, language.current);
      cm.operation(() => {
        cm.replaceRange(change.text, cm.posFromIndex(change.from), cm.posFromIndex(change.to), "markdown-format");
        cm.setSelection(cm.posFromIndex(change.selectionFrom), cm.posFromIndex(change.selectionTo));
      });
    }
    cm.focus();
  }

  function insertImage(url: string) {
    const cm = editor.current;
    if (!cm || callbacks.current.disabled) return;
    cm.replaceSelection(`![image](<${url.replace(/[<>\n\r]/g, "")}>)\n`, "end", "+input");
    cm.focus();
  }
  useImperativeHandle(ref, () => ({ insertImage }));

  useEffect(() => {
    let disposed = false;
    let marks: TextMarker[] = [];
    let cm: Editor | null = null;
    async function init() {
      const { default: CodeMirror } = await import("codemirror");
      await import("codemirror/mode/markdown/markdown");
      if (disposed || !host.current) return;
      cm = CodeMirror(host.current, {
        value: callbacks.current.value, mode: { name: "markdown", taskLists: true, strikethrough: true }, lineWrapping: true,
        viewportMargin: 10, readOnly: callbacks.current.disabled, tabSize: 2,
        inputStyle: "contenteditable", screenReaderLabel: language.current ? "Markdown content" : "正文编辑",
      });
      editor.current = cm;
      cm.getInputField().setAttribute("role", "textbox");
      cm.getInputField().setAttribute("aria-multiline", "true");
      setReady(true);
      const updateToolbar = (instance: Editor) => {
        setHeadingLevel(instance.getLine(instance.getCursor().line).match(/^ {0,3}(#{1,6})(?:[\t ]+|$)/)?.[1].length || 0);
        setHistory(instance.historySize());
      };
      cm.on("cursorActivity", updateToolbar);
      cm.on("keydown", (_instance, event) => {
        if ((!event.ctrlKey && !event.metaKey) || callbacks.current.disabled) return;
        const key = event.key.toLowerCase();
        let command: MarkdownCommand | undefined;
        if (/^[0-6]$/.test(key) && !event.shiftKey) command = `heading-${Number(key) as 0 | 1 | 2 | 3 | 4 | 5 | 6}`;
        else if (!event.altKey) {
          if (!event.shiftKey) command = ({ b: "bold", i: "italic", u: "underline", e: "inline-code", k: "link" } as Record<string, MarkdownCommand>)[key];
          else command = ({ s: "strike", k: "code-block", q: "quote", "8": "unordered-list", "*": "unordered-list", "7": "ordered-list", "&": "ordered-list", "9": "task-list", "(": "task-list" } as Record<string, MarkdownCommand>)[key];
        }
        if (command) { event.preventDefault(); event.stopPropagation(); format(command); }
      });
      redraw.current = () => {
        if (!cm || disposed) return;
        const instance = cm;
        instance.operation(() => {
          marks.forEach(mark => mark.clear());
          marks = [];
          if (sourceModeRef.current) return;
          for (const image of getMarkdownImages(instance.getValue())) {
            const wrapper = document.createElement("span");
            wrapper.className = "markdown-inline-image";
            wrapper.contentEditable = "false";
            const img = document.createElement("img");
            img.src = image.url;
            img.alt = image.alt || (language.current ? "Image" : "正文图片");
            img.draggable = false;
            const mark = instance.markText(instance.posFromIndex(image.from), instance.posFromIndex(image.to), {
              replacedWith: wrapper, atomic: true, clearOnEnter: false, handleMouseEvents: true,
            });
            img.onload = () => { if (!disposed) mark.changed(); };
            img.onerror = () => {
              img.hidden = true;
              wrapper.textContent = language.current ? "Image unavailable · edit in source mode" : "图片加载失败，可切换源码修改";
              mark.changed();
            };
            wrapper.appendChild(img);
            marks.push(mark);
          }
        });
      };
      cm.on("change", instance => {
        callbacks.current.onChange(instance.getValue());
        redraw.current();
        updateToolbar(instance);
      });
      const upload = async (file: File, event: Event) => {
        event.preventDefault();
        if (uploadBusy.current || callbacks.current.disabled || !cm) return;
        uploadBusy.current = true; setUploading(true); setError("");
        // Bookmarks track the insertion point if text changes while the upload is in flight.
        const bookmark = cm.setBookmark(cm.getCursor(), { insertLeft: true });
        try {
          const data = new FormData(); data.set("file", file);
          const result = await uploadImageFile(data);
          if (disposed) return;
          if ("error" in result) setError(result.error);
          else {
            const at = bookmark.find();
            if (at) cm.setCursor(at);
            insertImage(result.url);
          }
        } catch { if (!disposed) setError(language.current ? "Upload failed. Try again." : "上传失败，请重试。"); }
        finally { bookmark.clear(); uploadBusy.current = false; if (!disposed) setUploading(false); }
      };
      cm.on("paste", (_instance, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find(file => file.type.startsWith("image/"));
        if (file) void upload(file, event);
      });
      cm.on("drop", (instance, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find(file => file.type.startsWith("image/"));
        if (file) {
          instance.setCursor(instance.coordsChar({ left: event.clientX, top: event.clientY }, "window"));
          void upload(file, event);
        }
      });
      redraw.current();
      updateToolbar(cm);
    }
    void init();
    return () => { disposed = true; marks.forEach(mark => mark.clear()); editor.current = null; host.current?.replaceChildren(); };
  }, []);

  useEffect(() => {
    const cm = editor.current;
    if (cm && cm.getValue() !== value) { cm.setValue(value); redraw.current(); }
  }, [value]);
  useEffect(() => { editor.current?.setOption("readOnly", disabled); }, [disabled]);

  const groups = [
    [{ command: "bold", label: en ? "Bold" : "加粗", key: "Ctrl+B", icon: Bold }, { command: "italic", label: en ? "Italic" : "斜体", key: "Ctrl+I", icon: Italic }, { command: "underline", label: en ? "Underline" : "下划线", key: "Ctrl+U", icon: Underline }, { command: "strike", label: en ? "Strikethrough" : "删除线", key: "Ctrl+Shift+S", icon: Strikethrough }],
    [{ command: "quote", label: en ? "Quote" : "引用", key: "Ctrl+Shift+Q", icon: Quote }, { command: "unordered-list", label: en ? "Bullet list" : "无序列表", key: "Ctrl+Shift+8", icon: List }, { command: "ordered-list", label: en ? "Numbered list" : "有序列表", key: "Ctrl+Shift+7", icon: ListOrdered }, { command: "task-list", label: en ? "Task list" : "任务列表", key: "Ctrl+Shift+9", icon: ListTodo }],
    [{ command: "link", label: en ? "Link" : "链接", key: "Ctrl+K", icon: Link }, { command: "inline-code", label: en ? "Inline code" : "行内代码", key: "Ctrl+E", icon: Code }, { command: "code-block", label: en ? "Code block" : "代码块", key: "Ctrl+Shift+K", icon: Code2 }, { command: "table", label: en ? "Table" : "表格", key: "", icon: Table }, { command: "rule", label: en ? "Horizontal rule" : "分隔线", key: "", icon: Minus }],
    [{ command: "undo", label: en ? "Undo" : "撤销", key: "Ctrl+Z", icon: Undo2 }, { command: "redo", label: en ? "Redo" : "重做", key: "Ctrl+Y", icon: Redo2 }],
  ];

  return <div className="markdown-image-editor" id={id}>
    <div className="markdown-format-toolbar" role="toolbar" aria-label={en ? "Markdown formatting" : "Markdown 编辑工具栏"}>
      <select aria-label={en ? "Heading level" : "标题级别"} title={en ? "Ctrl+1–6: headings; Ctrl+0: paragraph" : "Ctrl+1–6：标题；Ctrl+0：正文"} value={headingLevel} disabled={disabled || !ready} onChange={event => format(`heading-${Number(event.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6}`)}>
        <option value={0}>{en ? "Paragraph" : "正文"}</option>{[1, 2, 3, 4, 5, 6].map(level => <option value={level} key={level}>H{level} · {en ? `Heading ${level}` : `${level} 级标题`}</option>)}
      </select>
      {groups.map((group, index) => <div className="markdown-format-group" key={index}>{group.map(({ command, label, key, icon: Icon }) => <button type="button" key={command} aria-label={label} title={label + (key ? ` (${key})` : "")} disabled={disabled || !ready || (command === "undo" && !history.undo) || (command === "redo" && !history.redo)} onMouseDown={event => event.preventDefault()} onClick={() => format(command as MarkdownCommand | "undo" | "redo")}><Icon size={16} strokeWidth={1.7} /></button>)}</div>)}
    </div>
    <div className="markdown-image-editor-bar">
      <span>{uploading ? (en ? "Uploading image…" : "图片上传中…") : (en ? "Images appear directly in your text" : "图片直接显示在正文中")}</span>
      <button type="button" aria-pressed={sourceMode} onClick={() => {
        sourceModeRef.current = !sourceMode; setSourceMode(!sourceMode); redraw.current();
      }}>{sourceMode ? (en ? "Show images" : "显示图片") : (en ? "Markdown source" : "Markdown 源码")}</button>
    </div>
    <div className="markdown-image-editor-body">
      {!value && <span className="markdown-editor-placeholder">{placeholder}</span>}
      <div ref={host} />
    </div>
    {error && <p role="alert">{error}</p>}
  </div>;
});
