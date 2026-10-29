export default function Loading() {
  return <div role="status" aria-live="polite" className="admin-loading">
    <span className="admin-spinner" aria-hidden="true" />
    <span>加载中… / Loading…</span>
  </div>;
}
