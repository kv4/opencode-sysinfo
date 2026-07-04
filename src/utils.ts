export const SPARK_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function calcCpuPercent(
  prev: { idle: number; total: number }[],
  curr: { idle: number; total: number }[],
): number {
  const deltas = curr.map((s, i) => ({
    idle: s.idle - prev[i].idle,
    total: s.total - prev[i].total,
  }));
  const totalIdle = deltas.reduce((s, d) => s + d.idle, 0);
  const totalAll = deltas.reduce((s, d) => s + d.total, 0);
  return totalAll === 0 ? 0 : Math.round((1 - totalIdle / totalAll) * 100);
}

export function sparkline(values: number[]): string {
  return values
    .map((v) => {
      const clamped = Math.max(0, Math.min(100, v));
      return SPARK_CHARS[Math.round((clamped / 100) * (SPARK_CHARS.length - 1))];
    })
    .join("");
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
