"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { Editor, TextMarker } from "codemirror";
import { getMarkdownImages } from "@/lib/markdown-images";
import { uploadImageFile } from "@/server-actions/upload";
import "codemirror/lib/codemirror.css";

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
  const en = useLocale() === "en";
  const language = useRef(en);
  language.current = en;

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
        value: callbacks.current.value, mode: "markdown", lineWrapping: true,
        viewportMargin: 10, readOnly: callbacks.current.disabled, tabSize: 2,
        inputStyle: "contenteditable", screenReaderLabel: language.current ? "Markdown content" : "正文编辑",
      });
      editor.current = cm;
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
    }
    void init();
    return () => { disposed = true; marks.forEach(mark => mark.clear()); editor.current = null; host.current?.replaceChildren(); };
  }, []);

  useEffect(() => {
    const cm = editor.current;
    if (cm && cm.getValue() !== value) { cm.setValue(value); redraw.current(); }
  }, [value]);
  useEffect(() => { editor.current?.setOption("readOnly", disabled); }, [disabled]);

  return <div className="markdown-image-editor" id={id}>
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
