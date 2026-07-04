import { describe, expect, test } from "bun:test";
import { calcCpuPercent, sparkline, formatDuration, SPARK_CHARS } from "../src/utils";

describe("calcCpuPercent", () => {
  test("0% when idle equals total", () => {
    const prev = [{ idle: 100, total: 100 }];
    const curr = [{ idle: 200, total: 200 }];
    expect(calcCpuPercent(prev, curr)).toBe(0);
  });

  test("100% when idle is 0", () => {
    const prev = [{ idle: 100, total: 100 }];
    const curr = [{ idle: 100, total: 200 }];
    expect(calcCpuPercent(prev, curr)).toBe(100);
  });

  test("50% when half idle half work", () => {
    const prev = [{ idle: 100, total: 200 }];
    const curr = [{ idle: 150, total: 300 }];
    expect(calcCpuPercent(prev, curr)).toBe(50);
  });

  test("0% when no delta (same snapshot)", () => {
    const prev = [{ idle: 100, total: 200 }];
    const curr = [{ idle: 100, total: 200 }];
    expect(calcCpuPercent(prev, curr)).toBe(0);
  });

  test("0% when totalAll is 0 (division by zero)", () => {
    const prev = [{ idle: 100, total: 100 }];
    const curr = [{ idle: 100, total: 100 }];
    expect(calcCpuPercent(prev, curr)).toBe(0);
  });

  test("multi-core: aggregates across all cores", () => {
    const prev = [
      { idle: 100, total: 200 },
      { idle: 100, total: 200 },
    ];
    const curr = [
      { idle: 120, total: 240 },
      { idle: 120, total: 240 },
    ];
    const totalIdle = (120 - 100) + (120 - 100);
    const totalAll = (240 - 200) + (240 - 200);
    const expected = Math.round((1 - totalIdle / totalAll) * 100);
    expect(calcCpuPercent(prev, curr)).toBe(expected);
  });

  test("rounds to nearest integer", () => {
    const prev = [{ idle: 100, total: 200 }];
    const curr = [{ idle: 100, total: 201 }];
    const expected = Math.round((1 - 0 / 1) * 100);
    expect(calcCpuPercent(prev, curr)).toBe(100);
  });
});

describe("sparkline", () => {
  test("empty array produces empty string", () => {
    expect(sparkline([])).toBe("");
  });

  test("all 0% values produce all ▁", () => {
    expect(sparkline([0, 0, 0])).toBe("▁▁▁");
  });

  test("all 100% values produce all █", () => {
    expect(sparkline([100, 100, 100])).toBe("███");
  });

  test("50% produces ▅", () => {
    expect(sparkline([50])).toBe("▅");
  });

  test("maps each value to correct character", () => {
    const result = sparkline([0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100]);
    expect(result).toBe("▁▂▃▄▅▅▆▇█");
    expect(result.length).toBe(9);
  });

  test("clamps out-of-range values", () => {
    expect(sparkline([-1])).toBe("▁");
    expect(sparkline([200])).toBe("█");
  });
});

describe("formatDuration", () => {
  test("0ms produces 0s", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  test("less than 60 seconds shows only seconds", () => {
    expect(formatDuration(5000)).toBe("5s");
    expect(formatDuration(59000)).toBe("59s");
  });

  test("exactly 60 seconds", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
  });

  test("between 1 and 60 minutes", () => {
    expect(formatDuration(90000)).toBe("1m 30s");
    expect(formatDuration(3599000)).toBe("59m 59s");
  });

  test("exactly 1 hour", () => {
    expect(formatDuration(3600000)).toBe("1h 0m");
  });

  test("more than 1 hour", () => {
    expect(formatDuration(3660000)).toBe("1h 1m");
    expect(formatDuration(7200000)).toBe("2h 0m");
  });

  test("large values", () => {
    expect(formatDuration(86400000)).toBe("24h 0m");
  });
});
