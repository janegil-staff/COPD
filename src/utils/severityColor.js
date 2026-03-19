export function severityColor(value) {
  if (value === null || value === undefined) return null;
  if (value <= 3) return { bg: "#e6f7f5", text: "#0f6e56" };
  if (value <= 6) return { bg: "#faeeda", text: "#854f0b" };
  return { bg: "#fcebeb", text: "#a32d2d" };
}