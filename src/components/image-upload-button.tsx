"use client";

import { useState, useRef, useCallback } from "react";
import { uploadImageFile } from "@/server-actions/upload";
import { ImageIcon, Loader2, UploadIcon } from "lucide-react";

interface Props {
  onUploaded: (url: string) => void;
  className?: string;
}

export function ImageUploadButton({ onUploaded, className = "" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImageFile(formData);
    setUploading(false);

    if ("url" in result) {
      onUploaded(result.url);
    } else {
      setError(result.error);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    } else {
      setError("请拖入图片文件");
    }
  }, []);

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        onDragEnter={handleDragIn}
        onDragOver={handleDrag}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-ui text-xs
                   border rounded-md transition-all disabled:opacity-50 whitespace-nowrap
                   ${dragOver
                     ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                     : "border-border bg-bg-elevated hover:border-accent"
                   }`}
        title="上传图片（支持拖拽）"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : dragOver ? (
          <UploadIcon size={14} className="text-accent" />
        ) : (
          <ImageIcon size={14} />
        )}
        {uploading ? "上传中…" : dragOver ? "释放上传" : "上传图片"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <span className="text-red-400 text-xs font-ui">{error}</span>
      )}
    </span>
  );
}
