# opencode-sysinfo

OpenCode TUI plugin that shows system info in the sidebar: hostname, project, RAM, CPU (with sparkline), battery status, and session duration.

## Motivation

I work on multiple laptops — home, office, client sites — all accessed via SSH from a single terminal. Switching between them, especially on the same project, it's easy to lose track of where you are. A quick `uname -n` helps, but it breaks flow.

This plugin puts the hostname, project directory, resource usage, and battery level right in the OpenCode sidebar. At a glance, you know which machine you're on, how it's doing, and how long you've been connected. No more wondering "am I on the office laptop or the client one?"

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
