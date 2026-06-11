export function toWebpPath(src: string): string {
  const i = src.lastIndexOf(".");
  if (i === -1) return src;
  const ext = src.slice(i + 1).toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "png") {
    return src.slice(0, i) + ".webp";
  }
  return src;
}