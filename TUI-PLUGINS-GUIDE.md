# TUI-плагины OpenCode — полное руководство

## Архитектура

В OpenCode есть два типа плагинов:

| Server-плагины | TUI-плагины |
|---|---|
| Хуки/тулзы/ивенты | Интерфейс (панели, слоты) |
| `export const MyPlugin: Plugin = ...` | `export default { id, tui }` |
| `Plugin` из `@opencode-ai/plugin` | `TuiPlugin` из `@opencode-ai/plugin/tui` |
| `api.slots.register()` — меняют интерфейс | |

TUI-плагины управляют интерфейсом: слоты в боковой панели, промпты, хедер, футер.

---

## Регистрация плагина

### Файл `tui.json` (в корне проекта)

```json
{
  "plugin": ["./.opencode/plugins/sidebar-info.tsx"]
}
```

**Важно:** ключ — `"plugin"` (единственное число), не `"plugins"`. JSON-схема OpenCode отвергает неизвестные ключи.

### Авто-загрузка из директории

Файлы `.opencode/plugins/*.tsx` загружаются автоматически, но для TUI-плагинов требуется явная регистрация в `tui.json` или `opencode.json`.

---

## Структура TUI-плагина

```tsx
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin } from "@opencode-ai/plugin/tui";

const tui: TuiPlugin = async (api) => {
  // инициализация
};

export default { id: "my-plugin", tui };
```

### Что обязательно:
1. **JSX-прагма** — первая строка: `/** @jsxImportSource @opentui/solid */`
2. **Импорт типа** — `import type { TuiPlugin } from "@opencode-ai/plugin/tui"`
3. **Экспорт** — `export default { id: string, tui: TuiPlugin }`
4. **TuiPlugin — это функция**, не объект с `init`

### Intrinsic-элементы (без импорта):
- `<box>`, `<text>`, `<b>`, `<span>`
- `<Show>`, `<For>`, `<createMemo>` — из `solid-js` (если нужна реактивность)

---

## API слотов: `api.slots.register()`

### Правильный синтаксис (из исходников OpenCode):

```tsx
api.slots.register({
  order: 100,
  slots: {
    sidebar_content(ctx, props) {
      return <box borderStyle="single" title="🎯 Env Info">
        <text fg="cyan">Machine: {hostname}</text>
      </box>;
    },
    // можно зарегистрировать несколько слотов в одном вызове
    // sidebar_footer(ctx, props) { ... },
  },
});
```

### Структура объекта регистрации:

```typescript
{
  order?: number;                    // порядок в слоте (меньше = выше)
  slots: {
    [SlotName]: (ctx, props) => JSX.Element;
  }
}
```

- `order` — на **верхнем уровне**, не внутри слота
- `slots` — объект, где ключ — имя слота, значение — **функция** `(ctx, props) => JSX.Element`
- Функция получает `ctx` (контекст слота) и `props` (пропсы слота, например `{ session_id }`)

### Частые ошибки:

```tsx
// ❌ НЕПРАВИЛЬНО
api.slots.register("sidebar_content", { order: 10, component: () => ... });

// ❌ НЕПРАВИЛЬНО
api.slots.register({
  sidebar_content: { order: 10, component: () => ... }
});

// ❌ НЕПРАВИЛЬНО
api.slots.register({
  order: 10,
  sidebar_content: { component: () => ... }
});

// ✅ ПРАВИЛЬНО
api.slots.register({
  order: 10,
  slots: {
    sidebar_content() { return ... }
  },
});
```

---

## Доступные слоты (TuiHostSlotMap)

| Слот | Пропсы | Описание |
|---|---|---|
| `app` | `{}` | Корневой слот приложения |
| `app_bottom` | `{}` | Низ приложения |
| `home_logo` | `{}` | Логотип на главной |
| `home_prompt` | `{ ref? }` | Поле ввода на главной |
| `home_prompt_right` | `{}` | Справа от поля ввода |
| `session_prompt` | `{ session_id, visible?, disabled? }` | Поле ввода в сессии |
| `session_prompt_right` | `{ session_id }` | Справа от поля ввода в сессии |
| `home_bottom` | `{}` | Низ главной |
| `home_footer` | `{}` | Футер главной |
| `sidebar_title` | `{ session_id, title, share_url? }` | Заголовок сайдбара |
| **`sidebar_content`** | **`{ session_id }`** | **Контент сайдбара** |
| `sidebar_footer` | `{ session_id }` | Футер сайдбара |

`sidebar_content` отображается только когда открыта сессия.

---

## Компоненты в сайдбаре (из встроенных плагинов)

```tsx
// пример Context-виджета
function View(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current;

  return (
    <box>
      <text fg={theme().text}><b>Context</b></text>
      <text fg={theme().textMuted}>some info</text>
    </box>
  );
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} />;
      },
    },
  });
};

export default { id: "my-plugin", tui };
```

Полезные трюки из builtins:
- `api.slots.register()` возвращает `string` (ID регистрации)
- Для реактивности используйте `createMemo`, `createSignal` из `solid-js`
- Цвета берите из темы: `api.theme.current.text`, `api.theme.current.textMuted`, `api.theme.current.success` и т.д.
- Встроенный `Locale.truncateLeft()` для обрезки длинных строк

---

## Отладка

```bash
# Лог OpenCode
tail -f ~/.local/share/opencode/log/opencode.log

# Поиск ошибок плагина
grep -i "plugin\|error\|tui config\|invalid\|skip" ~/.local/share/opencode/log/opencode.log

# Успешная загрузка выглядит так:
# "loading tui config" path=.../tui.json
# "applying tui config" path=.../tui.json order=1
```

После изменения кода плагина или `tui.json` — **перезапустите OpenCode**. Watcher подхватывает изменения, но не всегда.

---

## Полный пример рабочего плагина

```tsx
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin } from "@opencode-ai/plugin/tui";
import os from "node:os";
import path from "node:path";

const tui: TuiPlugin = async (api) => {
  const hostname = os.hostname();
  const projectName = path.basename(process.cwd());

  api.slots.register({
    order: 10,
    slots: {
      sidebar_content() {
        return (
          <box borderStyle="single" title="🖥 Env Info">
            <text fg="cyan">Machine: {hostname}</text>
            <text fg="green">Project: {projectName}</text>
          </box>
        );
      },
    },
  });
};

export default { id: "sidebar-info", tui };
```
