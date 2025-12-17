export function parseInputValues(rawInput) {
  if (!rawInput) return [];
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // JSON style array, e.g. [1,2,3]
  const looksLikeList =
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("(") && trimmed.endsWith(")"));

  if (looksLikeList) {
    try {
      const parsed = JSON.parse(
        trimmed
          .replace(/^\(/, "[")
          .replace(/\)$/, "]")
          .replace(/'/g, '"'),
      );
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (err) {
      const inner = trimmed.slice(1, -1);
      const manual = inner
        .split(",")
        .map((piece) => piece.trim())
        .filter(Boolean);
      if (manual.length) return manual;
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((piece) => piece.trim())
      .filter(Boolean);
  }

  // Space separated values (e.g. "7 3 6")
  if (/\s+/.test(trimmed) && !Number.isNaN(Number(trimmed.split(/\s+/)[0]))) {
    return trimmed
      .split(/\s+/)
      .map((piece) => piece.trim())
      .filter(Boolean);
  }

  return [trimmed];
}
