# opencode-sysinfo

OpenCode TUI plugin that shows system info in the sidebar: hostname, project, RAM, CPU (with sparkline), battery status, and session duration.

## Example

```
┌─ 🖥 Env Info ──────────────┐
│ Machine: thinkpad-x1      │
│ Project: your-project-name│
│ RAM: 4.2/15.6 GB          │
│ BAT: 67% ⚡                │
│ CPU: 14% (12 cores)       │
│ ▁▃▂▁▁▂▄▆███▇▆▄▃▂▁▁▂▃▄     │
│ Session: 2h 15m           │
└───────────────────────────┘
```

## Installation

Add to your `tui.json` (project root or `~/.config/opencode/tui.json`):

```json
{
  "plugin": ["opencode-sysinfo"]
}
```

OpenCode will auto-install the package from npm on next startup.

## Requirements

- Linux (tested). Battery reading requires `/sys/class/power_supply/BAT0`.
- OpenCode with TUI support.

## Development

```bash
git clone <repo>
cd opencode-sysinfo
bun install
bun test        # run tests (20 tests)
bun run build   # build dist/
```

## License

MIT
