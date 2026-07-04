# sidebar-info

OpenCode TUI plugin that shows system info in the sidebar: hostname, project, RAM, CPU (with sparkline), battery status, and session duration.

## Installation

Add to your `tui.json` (project root or `~/.config/opencode/tui.json`):

```json
{
  "plugin": ["sidebar-info"]
}
```

OpenCode will auto-install the package on next startup.

## Requirements

- Linux (tested). Battery reading requires `/sys/class/power_supply/BAT0`.
- OpenCode with TUI support.

## Development

```bash
git clone <repo>
cd sidebar-info
bun install
bun test        # run tests
bun run build   # build dist/
```

## License

MIT
