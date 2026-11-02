/** Public mount point. Next Link/router paths stay app-relative; raw URLs use sitePath. */
export const BASE_PATH = "/blog";

export function sitePath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || /^\/blog(?:[/?#]|$)/.test(value)) return value;
  return BASE_PATH + (value === "/" ? "" : value);
}

export function appPath(value: string): string {
  if (!/^\/blog(?:[/?#]|$)/.test(value)) return value;
  const path = value.slice(BASE_PATH.length);
  return !path || /^[?#]/.test(path) ? "/" + path : path;
}

/** Display compatibility for stored links; source Markdown and database URLs remain unchanged. */
export function contentUrl(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  if (/^\/blog\/(?:[?#]|$)/.test(value)) return value;
  if (/^\/blog\/(?!articles(?:[/?#]|$)|notes(?:[/?#]|$)|projects(?:[/?#]|$)|about(?:[/?#]|$)|admin(?:[/?#]|$)|admin-login(?:[/?#]|$)|api(?:[/?#]|$)|uploads(?:[/?#]|$)|_next\/|cursors\/|icon\.)/.test(value)) {
    return sitePath("/articles/" + value.slice("/blog/".length));
  }
  return sitePath(value);
}

/** Only allow a destination within the management subtree, including legacy login return URLs. */
export function adminReturnPath(value: string): string {
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return sitePath("/admin"); }
  const internal = appPath(decoded);
  if (!/^\/admin(?:[/?#]|$)/.test(internal) || /[\\\r\n]/.test(decoded) || internal.includes("..") || /%[\da-f]{2}/i.test(internal.split(/[?#]/)[0])) return sitePath("/admin");
  return sitePath(internal);
}
