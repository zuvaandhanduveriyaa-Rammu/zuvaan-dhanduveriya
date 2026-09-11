export function formatMvr(n: number) {
  const rounded = Math.round(n * 100) / 100;
  const digits = Number.isInteger(rounded) ? 0 : 2;
  return `MVR ${rounded.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  })}`;
}

export function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
