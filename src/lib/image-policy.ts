export const IMAGE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export type ImageUsage = { kind: "article" | "note" | "project"; title: string; href: string; status: "draft" | "published" };
export type ImageSource = ImageUsage & { fields: (string | null | undefined)[] };

export function validImageName(name: string) {
  return /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.(?:jpe?g|png|gif|webp|svg)$/i.test(name) && !name.includes("..");
}

/** Conservative scan: also protect links and code examples rather than risking a broken reference. */
export function collectImageUsage(sources: ImageSource[]) {
  const usage = new Map<string, ImageUsage[]>();
  for (const { fields, ...source } of sources) {
    const names = new Set<string>();
    for (const field of fields) {
      let text = field || "";
      for (let pass = 0; pass < 3; pass++) {
        text = text.replace(/&#(?:x([0-9a-f]+)|(\d+));?/gi, (_match, hex, decimal) => {
          const code = parseInt(hex || decimal, hex ? 16 : 10);
          return code <= 0x10ffff ? String.fromCodePoint(code) : "";
        }).replace(/&sol;/gi, "/").replace(/\\\//g, "/");
        for (const match of text.matchAll(/\/uploads\/([a-zA-Z0-9_%.-]+)/g)) {
          try { const name = decodeURIComponent(match[1]).replace(/\.+$/, ""); if (validImageName(name)) names.add(name); } catch { /* malformed encoding does not name a stored file */ }
        }
        text = text.replace(/(?:%[0-9a-f]{2})+/gi, value => { try { return decodeURIComponent(value); } catch { return value; } });
      }
    }
    for (const name of names) usage.set(name, [...(usage.get(name) || []), source]);
  }
  return usage;
}

export function imageLifecycle(referenceCount: number, lastUploadedAt: string, unreferencedSince: string | null, now: number) {
  if (referenceCount) return { status: "used" as const, cleanupAfter: null };
  const start = Math.max(Date.parse(lastUploadedAt), Date.parse(unreferencedSince || lastUploadedAt));
  const cleanupAfter = new Date(start + IMAGE_RETENTION_MS).toISOString();
  return { status: now >= start + IMAGE_RETENTION_MS ? "unused" as const : "temporary" as const, cleanupAfter };
}
