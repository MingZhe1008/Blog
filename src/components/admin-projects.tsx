"use client";
import { AdminImagePreview } from "@/components/admin-image-preview";
import { useState } from "react";
import type { Project } from "@/lib/projects";
import { saveProject, deleteProject } from "@/server-actions/projects";
import { uploadImageFile } from "@/server-actions/upload";

const blank = { title: "", description: "", coverImage: "", url: "", sourceUrl: "", tags: [] as string[], status: "持续更新", published: false };
export function AdminProjects({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<(typeof blank & { id?: number }) | null>(null);
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function edit(project: typeof blank & { id?: number }) { setEditing({ ...project }); setTags(project.tags.join(", ")); setMessage(""); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!editing || busy) return;
    setBusy(true); setMessage("");
    try {
      const result = await saveProject({ ...editing, tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) });
      if (result.error) setMessage(result.error);
      else { setEditing(null); setMessage("已保存，项目页面已更新。"); }
    } catch { setMessage("保存失败，请重试。"); } finally { setBusy(false); }
  }
  return <div>
    <div className="section-heading"><h1>项目管理</h1><button onClick={() => edit(blank)} disabled={busy}>新增项目</button></div>
    <p role="status" className="admin-feedback">{message}</p>
    {editing && <form onSubmit={save} className="admin-project-form">
      <h2>{editing.id ? "编辑项目" : "新增项目"}</h2>
      <fieldset disabled={busy}>
        <label>项目名称<input required maxLength={200} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>项目简介<textarea required rows={4} maxLength={5000} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
        <details className="admin-url-editor"><summary>编辑图片地址 / Image URL</summary><label>封面地址<input value={editing.coverImage} onChange={e => setEditing({ ...editing, coverImage: e.target.value })} placeholder="上传图片或输入 https:// 地址" /></label></details>
        <label>上传封面（最大 10MB）<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={async e => {
          const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
          setBusy(true); setMessage("");
          try { const form = new FormData(); form.set("file", file); const result = await uploadImageFile(form);
            if ("error" in result) setMessage(result.error); else setEditing(current => current && ({ ...current, coverImage: result.url }));
          } catch { setMessage("上传失败，请重试。"); } finally { setBusy(false); }
        }} /></label>
        {editing.coverImage && <div><AdminImagePreview src={editing.coverImage} alt="项目封面 / Project cover" /><button type="button" onClick={() => setEditing({ ...editing, coverImage: "" })}>移除封面</button></div>}
        <label>项目地址<input value={editing.url} onChange={e => setEditing({ ...editing, url: e.target.value })} placeholder="https://… 或 /blog" /></label>
        <label>源码地址<input value={editing.sourceUrl} onChange={e => setEditing({ ...editing, sourceUrl: e.target.value })} placeholder="https://github.com/…" /></label>
        <label>标签（逗号分隔）<input value={tags} onChange={e => setTags(e.target.value)} /></label>
        <label>状态<select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>{["持续更新", "开发中", "已完成", "已归档"].map(s => <option key={s}>{s}</option>)}</select></label>
        <label className="admin-checkbox"><input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />在项目页面展示</label>
        <div className="project-links"><button type="submit">{busy ? "处理中…" : "保存项目"}</button><button type="button" onClick={() => setEditing(null)}>取消</button></div>
      </fieldset>
    </form>}
    <div className="admin-project-list">{projects.map(project => <article key={project.id} id={`project-${project.id}`}>
      <div className="admin-project-identity">{project.coverImage && <AdminImagePreview src={project.coverImage} alt={project.title} />}<div><h2>{project.title}</h2><p>{project.published ? "已展示" : "草稿"} · {project.status}</p></div></div>
      <div className="project-links"><button disabled={busy} onClick={() => edit(project)}>编辑</button><button disabled={busy} onClick={async () => {
        if (!confirm(`确定删除「${project.title}」？`)) return;
        setBusy(true);
        try { const result = await deleteProject(project.id); setMessage(result.error || "已删除项目。"); if (!result.error && editing?.id === project.id) setEditing(null); }
        catch { setMessage("删除失败，请重试。"); } finally { setBusy(false); }
      }}>删除</button></div>
    </article>)}</div>
    {!projects.length && <p>暂无项目，点击“新增项目”开始添加。</p>}
  </div>;
}
