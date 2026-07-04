/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui";
import { hostname, freemem, totalmem, cpus } from "node:os";
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { createSignal, createMemo, onCleanup } from "solid-js";
import { calcCpuPercent, sparkline, formatDuration } from "./utils";

const HISTORY_SIZE = 20;

function sampleCpuTimes() {
  return cpus().map((c) => ({
    idle: c.times.idle,
    total: Object.values(c.times).reduce((a, b) => a + b, 0),
  }));
}

function SessionDuration(props: { api: TuiPluginApi; session_id: string }) {
  const [dur, setDur] = createSignal("");

  const timer = setInterval(() => {
    const session = props.api.state.session.get(props.session_id);
    if (!session?.time?.created) return;
    const ms = Date.now() - session.time.created;
    setDur(formatDuration(ms));
  }, 1000);

  onCleanup(() => clearInterval(timer));

  const theme = () => props.api.theme.current;
  return <text fg={theme().info}>Session: {dur()}</text>;
}

const tui: TuiPlugin = async (api) => {
  const host = hostname();
  const project = path.basename(process.cwd());
  const cores = cpus().length;

  const [cpuPct, setCpuPct] = createSignal(0);
  const [history, setHistory] = createSignal<number[]>([]);
  const [ramUsed, setRamUsed] = createSignal("0");
  const [ramTotal, setRamTotal] = createSignal("0");
  const [batPct, setBatPct] = createSignal<string | null>(null);
  const [batStatus, setBatStatus] = createSignal<string | null>(null);
  const [blinkOn, setBlinkOn] = createSignal(false);

  function readBattery() {
    const bat = "/sys/class/power_supply/BAT0";
    if (!existsSync(bat)) return;
    try {
      setBatPct(readFileSync(`${bat}/capacity`, "utf8").trim());
      setBatStatus(readFileSync(`${bat}/status`, "utf8").trim());
    } catch {}
  }

  let prev = sampleCpuTimes();

  readBattery();

  const timer = setInterval(() => {
    const curr = sampleCpuTimes();
    const pct = calcCpuPercent(prev, curr);
    setCpuPct(pct);
    setHistory((h) => [...h.slice(-(HISTORY_SIZE - 1)), pct]);
    setRamUsed(((totalmem() - freemem()) / 1024 ** 3).toFixed(1));
    setRamTotal((totalmem() / 1024 ** 3).toFixed(1));
    readBattery();
    prev = curr;
  }, 2000);

  onCleanup(() => clearInterval(timer));

  const blinkTimer = setInterval(() => setBlinkOn((b) => !b), 500);
  onCleanup(() => clearInterval(blinkTimer));

  const border = createMemo(() => {
    const pct = batPct();
    if (!pct || parseInt(pct) >= 20) return undefined;
    return blinkOn() ? "red" : undefined;
  });

  const spark = createMemo(() => sparkline(history()));

  api.slots.register({
    order: 10,
    slots: {
      sidebar_content(_ctx, props) {
        return (
          <box borderStyle="single" borderColor={border()} title="🖥 Env Info">
            <text fg="cyan">Machine: {host}</text>
            <text fg="green">Project: {project}</text>
            <text fg="yellow">RAM: {ramUsed()}/{ramTotal()} GB</text>
            {batPct() && <text fg={batStatus() === "Charging" ? "green" : "yellow"}>BAT: {batPct()}%{batStatus() === "Charging" ? " ⚡" : ""}</text>}
            <text fg="magenta">CPU: {cpuPct()}% ({cores} cores)</text>
            <text fg="magenta">{spark()}</text>
            <SessionDuration api={api} session_id={props.session_id} />
          </box>
        );
      },
    },
  });
};

export default { id: "sidebar-info", tui };
