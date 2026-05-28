# Plug-I/O — Design Brief для Claude (UI/UX Generation Prompt)

> **Как использовать этот документ.** Передайте весь файл целиком в Claude (Sonnet 4.6 / Opus 4.7) или в любой design-focused агент. В конце есть готовый блок `PROMPT` — его можно скопировать как есть. Текущая визуальная база (тёмная тема + лайм-акцент) сохраняется как отправная точка, но дизайнер должен предложить **современный, премиальный, профессиональный** редизайн с продуманной системой компонентов, состояний и микровзаимодействий.

---

## 1. Продукт в одной фразе

**Plug-I/O** — это web-конструктор профессиональных аудио-стоек: пользователь собирает 19" рэк из реальных preamp / compressor / converter / interface устройств, переключает вид front ↔ rear и **прокладывает кабельные соединения** с валидацией сигнальной цепочки в реальном времени.

Аналог по жанру: что-то между **Figma**, **Modular Grid (eurorack-планировщик)** и **CAD для звукорежиссёров**. Но Plug-I/O — про **PRO audio rack**, не евро-модули, не сеть, не дата-центр.

---

## 2. Целевая аудитория

| Сегмент | Что им важно |
|---|---|
| **Sound engineers / FOH-инженеры** | Быстро собрать сцену/студию из реальных моделей; визуально проверить, что кабели «бьются» (XLR, Dante, MADI, ADAT, S/PDIF) |
| **Студийные архитекторы / системные интеграторы** | Документировать инсталляцию: экспорт PNG/JSON для клиента и монтажника |
| **Музыканты-продюсеры с собственной студией** | Спланировать покупку оборудования и понять, какие соединения возможны |
| **Преподаватели / студенты звукорежиссуры** | Учебный конструктор сигнальных цепей |

**Tone of voice:** premium, sober, инженерный. Никакого «cute», никаких градиентных пузырьков. Это инструмент для людей, которые умеют читать схему сигнала.

---

## 3. Продуктовые цели редизайна

1. **Premium feel** уровня Linear / Vercel / Arc / Raycast — но в индустриальной аудио-эстетике (студийная аппаратура, эталонные мониторы Genelec, интерфейс Pro Tools/Logic).
2. **Read-at-a-glance** — инженер должен за 1 секунду понять: где сигнал, где разрыв, какой порт что принимает.
3. **Tactile** — переключение front/rear, перетаскивание устройства, протяжка кабеля должны ощущаться физически (spring-анимации, лёгкая инерция, haptic-like motion).
4. **Density without clutter** — на экране одновременно: библиотека устройств, рама, inspector, статус-бар. Не должно превращаться в IDE из 90-х.
5. **Mobile-aware** (но не mobile-first) — на телефоне достаточно view-only + лёгкого редактирования; основной use case — desktop / iPad.

---

## 4. Стек и архитектурные ограничения

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (через `@tailwindcss/vite`)
- **Radix UI primitives** (Dialog, Popover, Tooltip)
- **Framer Motion 12** — для всех transitions
- **dnd-kit** — drag-and-drop
- **lucide-react** — иконки (можно дополнять; не использовать платные сеты)
- **SVG** для рендера рамы, фронт-панелей, портов и кабелей (не canvas, не WebGL)
- **Тёмная тема — основная**. Light mode можно предложить как доп. трек, но не обязателен.
- Шрифты сейчас: **DM Sans** (UI) + **IBM Plex Mono** (rack numbers). Если есть лучшая пара — обоснуйте.

> Дизайн должен быть реализуем в этом стеке. Не рисовать эффекты, которые потребуют WebGL/Three.js.

---

## 5. Все экраны и сценарии (обязательны к проработке)

### 5.1. Landing (`/`)
**Цель:** за 5 секунд донести «что это» и привести в редактор.

**Состояния:**
- Default desktop (1440+, 1920+)
- Tablet (834)
- Mobile (390)
- С анимированным hero (изометрия задней панели рэка / параллакс кабелей / SVG-кабель тянется к CTA)

**Контент-блоки:**
- Hero: логотип Plug-I/O, заголовок (≤7 слов), подзаголовок (≤20 слов), primary CTA «Start building» + secondary «Open last session» (если есть в localStorage)
- 3-step explainer: Choose rack size → Drag devices → Patch connections (сейчас есть, нужно довести до уровня Linear feature-strip)
- Social proof / use-case bar (опционально): «Used for live sound, studio install, audio education»
- Footer: краткий, без воды

### 5.2. Rack Size Configurator (modal над `/editor`)
**Цель:** выбрать размер рамы 4U / 6U / 8U / 12U / 16U / 24U.

**Состояния:**
- Open (анимированный entrance — scale + fade)
- Hover на варианте → preview-силуэт рамы в реальных пропорциях
- Selected → подсветка + лёгкий haptic-tick
- Confirm

> Подумайте: можно ли убрать модал и сделать выбор inline в editor через бесшовный split-screen? Предложите оба варианта.

### 5.3. Editor (`/editor`) — главный экран
Layout на десктопе: **3 колонки + top bar + status bar**.

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar: brand · rack-size · front/rear · undo/redo · save · export · help │
├──────────┬────────────────────────────────┬─────────────┤
│  Library │       Rack Canvas (SVG)         │  Inspector  │
│  (left)  │       front ↔ rear flip         │   (right)   │
│          │                                  │             │
├──────────┴────────────────────────────────┴─────────────┤
│  Status Bar: port hover / cable info / selection summary │
└─────────────────────────────────────────────────────────┘
```

**Состояния, которые ОБЯЗАНЫ быть в дизайне:**

| # | Состояние | Что показать |
|---|---|---|
| 1 | Empty rack | Подсказка-onboarding в раме, dimmed U-индексы, CTA «Drag a device or pick from popular» |
| 2 | Drag in progress (from library) | DragOverlay-превью устройства, целевой slot подсвечен лаймом, невалидные slots dimmed, trash-zone проявляется снизу |
| 3 | Drag in progress (reorder) | Превью на месте, исходный slot ghost-pattern, swap-индикатор если занято |
| 4 | Device selected (front) | Глоу-рамка вокруг устройства в раме + inspector раскрыт справа |
| 5 | Rear view, idle | Рендер задней панели, все порты видны, hover показывает label в status bar |
| 6 | Rear view, cable being drawn | От стартового порта тянется live-кабель за курсором; совместимые порты подсвечены, несовместимые dimmed + красный subtle ring при hover |
| 7 | Rear view, cable selected | Кабель подсвечен, в inspector показан route (Source → Dest) с метаданными |
| 8 | Invalid patch attempt | Toast с конкретной причиной («XLR analog out → AES/EBU in: protocol mismatch»), кабель не создаётся, port flash-red |
| 9 | Library search — empty result | Иллюстрированный empty state, «No devices match `xxx`. Clear filters?» |
| 10 | Library — filters active | Чипы активных фильтров над списком, кнопка Reset |
| 11 | Library — grid vs list toggle | Оба варианта проработать |
| 12 | Inspector — no selection | Лёгкий empty state «Select a device or cable to inspect» |
| 13 | Inspector — device | Имя, manufacturer, category, описание, порты (с протоколами и направлением), live-список текущих коннекшнов, спеки (frequency response, THD, dynamic range, power), кнопка Remove (destructive) |
| 14 | Inspector — cable | Source/Destination port details, protocol, длина (если задаём), кнопка Disconnect |
| 15 | Confirm delete (device with cables) | Modal: «Removing X will disconnect N cables. Continue?» |
| 16 | Clear rack confirmation | Modal с превью того, что удалится |
| 17 | Front ↔ Rear flip | Spring-анимация 3D flip canvas (не всего экрана) |
| 18 | Undo/Redo с историей > 0 | Счётчики, hover показывает «Undo: place WaveTec X73-A in slot 4» |
| 19 | Save toast | «Session saved · 14:02» + dismiss |
| 20 | Export menu | JSON / PNG / (предложить PDF spec sheet) |
| 21 | Onboarding tour (3 шага) | Spotlight + callout с next/skip |
| 22 | Loading session from localStorage | Skeleton рамы + skeleton library |
| 23 | Malformed session recovery | Banner сверху: «Your last session was partially restored. View details ▾» |
| 24 | Mobile editor | Library как bottom-sheet drawer, canvas доминирует, inspector — full-screen modal |
| 25 | Tablet editor | Library collapsed в иконочную колонку, inspector overlay |

### 5.4. Дополнительно — предложите как новые экраны/режимы

- **Compare view** — две сессии рядом (для звукорежиссёра, выбирающего между двумя топологиями)
- **Signal-flow overlay** — режим, где все кабели подсвечиваются по аудио-цепочкам (source → mix bus → master)
- **Share / read-only viewer** — публичная ссылка на конкретную сборку (только просмотр, можно вращать front/rear, нельзя редактировать)
- **Print / spec-sheet view** — A4-friendly экспорт со списком оборудования и патч-листом

---

## 6. Design System (deliverable обязательный)

Дизайнер должен оформить **полную систему**, а не только экраны.

### 6.1. Тема и токены

Текущая палитра (отправная точка, можно уточнять, но дух сохранить):

```
Background        #0F0F10   ▮  base
Surface           #161719   ▮  panels
Surface raised    #1D1F23   ▮  cards
Surface control   #26292E   ▮  buttons, inputs
Line              #34383F   ▮  dividers
Line strong       #4C525D   ▮  prominent borders
Copy              #F0F1F2   ▮  primary text
Muted             #9DA4AF   ▮  secondary text

Accent (primary)  #C8FF00   ▮  Lime — CTA, focus, active port
Amber             #D4820A   ▮  device accents, warm meters
Indigo            #6366F1   ▮  digital protocols
Danger            #E05454   ▮  destructive, validation errors
Info              #4093D6   ▮  neutral notifications
```

**Задачи дизайнера по токенам:**
- Расширить до полной палитры с шагами (50–900) для каждого цвета.
- Описать **семантические токены**: `--port-analog`, `--port-digital`, `--port-network`, `--port-power`, `--cable-active`, `--cable-selected`, `--cable-invalid`, и т.д.
- Цвет-кодирование **по протоколу** (Analog / AES-EBU / S-PDIF / ADAT / Dante / MADI / MIDI / Wordclock / USB / Bluetooth / Power) — выбрать 11 различимых, доступных цветов.
- Spacing scale, radius scale, elevation/shadow scale (тёмная тема — используем border + subtle inner glow вместо drop-shadow).
- Motion tokens: длительности (instant 80ms / fast 160ms / base 240ms / slow 400ms) и easings (standard, emphasized, decelerated, accelerated — по Material 3 терминологии).

### 6.2. Типографика

- Display / Heading / Body / Label / Mono — с конкретными размерами, line-height, tracking.
- Mono-вариант для номеров U в раме, для port-labels, для serial-like значений.
- Поддержка кириллицы — обязательна.

### 6.3. Компоненты (атомы → молекулы → организмы)

Все нужно отрисовать **во всех состояниях**: default, hover, focus-visible (keyboard ring!), active/pressed, disabled, loading, error.

**Атомы:**
- Button — primary / secondary / ghost / danger × sm / md / lg / icon-only
- Icon Button
- Input (text, search) с clear-affordance
- Select / Combobox
- Checkbox, Radio, Switch
- Chip / Tag (для активных фильтров и для протоколов)
- Tooltip
- Badge / Counter (для undo-history, для notifications)
- Divider
- Kbd (хоткеи в подсказках)

**Молекулы:**
- Top bar (со всеми группами действий)
- Status bar (port-hover info + cable-selected summary)
- Toast / Notification (info / success / warning / error)
- Modal / Dialog (Radix-based)
- Popover (Radix-based, для фильтров)
- Empty state
- Skeleton loaders

**Организмы:**
- **Device Card** — grid вариант (большая превью front-панели + название + manufacturer + chip с U-размером) и list вариант (компактная строка).
- **Device Library Panel** — заголовок + поиск + фильтры (категория, протокол, U) + сортировка (popularity / name / category) + переключатель grid/list + список карт + empty/loading состояния + collapse/expand на мобильном.
- **Rack Canvas** — рама с U-индексами слева, монтажные «уши» с винтами, паттерн пустых slots, передняя/задняя панели устройств, кабельная разводка (rear), zoom controls, pan-cursor, drop-targets.
- **Front Panel Renderer** — отрисовка контролов (knob, fader, button, display, meter, socket, screen) — нужны базовые SVG-примитивы в библиотеке, чтобы новые устройства собирались из них.
- **Rear Panel Renderer** — порты (26 типов разъёмов: XLR M/F, TRS, RCA, BNC, Ethernet-Dante, optical-ADAT, USB-A/B/C, Thunderbolt, powerCON, IEC, и т.д.) с цвет-кодом по протоколу.
- **Cable** — кривая Безье с тенью, индикаторами концов (XLR-pin, jack, RJ45 и т.д.), hover/selected/invalid состояния.
- **Inspector Panel** — заголовок + табы или секции (Overview / Ports / Connections / Specs) + actions внизу.
- **Device port glyph** — отдельный компонент-иконка (26 вариантов).

### 6.4. Иконография

- Library — список из `lucide-react`, используемых в UI (стандартизировать выбор).
- Кастомные SVG-глифы для портов и контролов front-панели.

### 6.5. Иллюстрации / Empty states

- 4–6 минималистичных monoline-иллюстраций для: empty rack, empty search, empty inspector, no cables, no saved sessions, malformed session.

---

## 7. Микровзаимодействия (motion brief)

Каждое нужно описать в Figma как frame-by-frame или как Lottie/код-сниппет.

| Действие | Поведение |
|---|---|
| Перетаскивание device из library | Карточка приподнимается (scale 1.02, shadow), снижается opacity исходной, появляется DragOverlay 1:1; целевые slots мягко пульсируют |
| Drop в валидный slot | Карточка «всасывается» в slot (scale + ease-out 240ms), лёгкий tick-glow по контуру |
| Drop в невалидный | Spring-bounce назад в библиотеку с red flash на target |
| Front ↔ Rear flip | 3D-rotation 600ms easing emphasized; устройства слегка раздвигаются на середине анимации |
| Старт кабеля | От порта расходится пульс (3 кольца, 800ms), курсор «прилипает» к концу кабеля |
| Проведение кабеля | Кривая Безье обновляется в realtime, при наведении на совместимый порт — port «втягивает» конец (snap) |
| Завершение кабеля | Snap + лёгкий haptic-flash на обоих портах, кабель materializes (draw-on path 240ms) |
| Невалидный коннект | Кабель «разрывается» в воздухе (path-disintegrate 200ms), toast slides in |
| Undo | Действие визуально откатывается с reverse-easing того же motion, что было при do |
| Selection | Glow-ring 1px lime + 8px outer glow с 30% opacity |
| Hover на порт | Halo вокруг порта + всплывает label в status-bar (никаких всплывающих тултипов поверх — они закрывают соседние порты) |
| Toast | Slide-up из правого нижнего угла, auto-dismiss 4s для info / стопор для error |

---

## 8. Accessibility (нужен явный чек-лист в финальном дизайне)

- Контраст: AA для всего обычного текста, AAA — для критичных (port labels, U-numbers, ошибки валидации).
- **Focus-visible ring** ОБЯЗАТЕЛЕН на всех интерактивных элементах. 2px lime ring со смещением 2px.
- Keyboard-only flow: Tab по library → canvas → inspector; стрелки внутри рамы переключают slot; Enter — place/select; пробел — toggle front/rear; Esc — отмена кабеля.
- Хоткеи (показать в дизайне help-modal с полным списком): `V` front, `R` rear, `Cmd/Ctrl+Z/Y` undo/redo, `Cmd/Ctrl+S` save, `Cmd/Ctrl+K` quick-search-library, `Del` remove selected, `?` open shortcuts.
- ARIA: role="dialog" на модалах, aria-label на всех icon-only кнопках, live-region для toasts и status-bar.
- Учитывать colorblind: цвет — никогда единственный носитель смысла. Протокол кабеля кодируется цветом + паттерном (solid / dashed / dotted) или иконкой на концах.
- Reduced motion: предусмотреть упрощённые transitions для `prefers-reduced-motion`.

---

## 9. Адаптивность

| Брейкпойнт | Поведение |
|---|---|
| ≥1440 desktop | Все 3 колонки видимы, comfortable density |
| 1024–1439 | Library collapsible to icon rail, inspector overlay по требованию |
| 768–1023 (tablet) | Library — bottom drawer, canvas доминирует, inspector — slide-over |
| <768 (mobile) | Library — full-screen sheet, canvas с pinch-zoom, inspector — full-screen modal; кабельная разводка — view-only, редактирование ограничено |

---

## 10. Что НЕ нужно делать

- Не нужны skeuomorphic «деревянные панели» и «винтажные VU» — это премиальный продакшн-инструмент, а не плагин-эмулятор. Лёгкие физические референсы (винты по углам рамы, текстуры рэка) — да, фотореализм — нет.
- Не использовать неоновые градиенты «киберпанк», радужные accent-цвета, glassmorphism с blur на каждой панели.
- Не плодить тени — в тёмной теме они не работают, используем borders + субтильный inner-glow на raised surfaces.
- Не делать «фановых» эмодзи и иллюстраций с персонажами. Только инженерный monoline.
- Не делать onboarding-тур обязательным (skip first-class).

---

## 11. Deliverable

Дизайнер (или Claude в роли дизайнера) предоставляет:

1. **Figma-файл** (или эквивалент в коде / Storybook) с разделами:
   - Foundations (color, type, spacing, radius, elevation, motion)
   - Components (все из §6.3, во всех состояниях)
   - Patterns (port-color-code, cable-rendering, drag-feedback)
   - Screens (все 25+ состояний из §5)
   - Mobile / Tablet
   - Motion specs (можно ссылками на Lottie / Principle / коротким видео)
2. **Token export** — JSON в формате W3C Design Tokens (или Tailwind config patch).
3. **Component-implementation notes** — где Radix/Tailwind покрывают, где нужен кастом.
4. **Краткий rationale** (≤1 страница) — какие сознательные сдвиги от текущего UI и почему.

Если deliverable генерирует Claude кодом — генерировать **производственный React + TypeScript + Tailwind v4 код** в файлах `src/shared/ui/*` и `src/features/*/ui/*`, **строго совместимый** с существующими store-ами и типами (см. `src/features/rack/use-rack-store.ts`, `src/entities/device/model/types.ts`).

---

## 12. Источники и якоря (для понимания текущего состояния)

Скриншоты текущего состояния находятся в [qa/screenshots/](qa/screenshots/):

- [01-landing-desktop.png](qa/screenshots/01-landing-desktop.png) — landing сейчас
- [03-frame-config.png](qa/screenshots/03-frame-config.png) — модал выбора размера
- [04-empty-editor.png](qa/screenshots/04-empty-editor.png) — пустой редактор
- [05-device-inspector.png](qa/screenshots/05-device-inspector.png) — inspector
- [07-active-cable-routing.png](qa/screenshots/07-active-cable-routing.png) — протяжка кабеля
- [08-back-selected-cable.png](qa/screenshots/08-back-selected-cable.png) — выбранный кабель
- [09-invalid-patch-toast.png](qa/screenshots/09-invalid-patch-toast.png) — ошибка валидации
- [11-empty-search.png](qa/screenshots/11-empty-search.png) — пустой поиск
- [12-editor-mobile.png](qa/screenshots/12-editor-mobile.png) — мобильная версия
- [25-desktop-port-hover-status.png](qa/screenshots/25-desktop-port-hover-status.png) — статус-бар на hover порта
- [30-desktop-routing-blocked.png](qa/screenshots/30-desktop-routing-blocked.png) — несовместимая коммутация

Ключевые исходники:

- [src/app/App.tsx](src/app/App.tsx) — роутинг
- [src/pages/landing/LandingPage.tsx](src/pages/landing/LandingPage.tsx)
- [src/pages/editor/EditorPage.tsx](src/pages/editor/EditorPage.tsx)
- [src/features/rack/use-rack-store.ts](src/features/rack/use-rack-store.ts) — полная модель состояния
- [src/entities/device/model/types.ts](src/entities/device/model/types.ts) — типы Device, Port, Control
- [src/data/devices.ts](src/data/devices.ts) — каталог реальных устройств
- [src/app/styles/index.css](src/app/styles/index.css) — текущие токены

---

## 13. PROMPT — готовый блок для Claude

> Скопируйте всё ниже в Claude как одну инструкцию. Перед запуском приложите содержимое этого файла целиком и (по возможности) скриншоты из `qa/screenshots/`.

```
ROLE
Ты — Senior Product Designer + Design Engineer с опытом в pro-audio (Avid, Universal Audio, Focusrite) и enterprise-tools (Linear, Figma, Vercel). Тебе нужно спроектировать целостный современный редизайн web-приложения Plug-I/O — конструктора профессиональных аудио-стоек.

CONTEXT
Прочитай прилагаемый DESIGN_BRIEF.md ПОЛНОСТЬЮ перед тем, как начать. В нём:
- продукт, аудитория, цели редизайна
- технический стек, в котором ты ОБЯЗАН остаться
- полный список экранов и состояний (§5)
- требуемая система компонентов (§6)
- спецификации motion (§7)
- a11y-требования (§8)
- адаптивность (§9)
- что НЕ делать (§10)

DELIVERABLES — выдай в следующем порядке, в одном ответе:
1. Design rationale (≤500 слов): какие 5–7 ключевых решений ты принял и почему. Покажи, как они улучшают текущее состояние (см. скриншоты qa/screenshots/).
2. Design tokens — полный набор в формате W3C Design Tokens JSON ИЛИ как Tailwind v4 `@theme` блок. Включи: colors (с семантикой портов и протоколов), spacing, radius, typography scale, motion (duration + easing), elevation.
3. Component spec — для каждого компонента из §6.3 опиши:
   - назначение,
   - все states (default/hover/focus-visible/active/disabled/loading/error/empty),
   - props и варианты,
   - размер, отступы, типографика,
   - какие Radix/lucide примитивы используются.
   Формат: компактные таблицы или structured markdown — не «полотно» текста.
4. Screen blueprints — для КАЖДОГО из 25+ состояний из §5 опиши:
   - layout (можно ASCII-схемой),
   - содержимое каждой зоны,
   - какие компоненты задействованы,
   - какие motion-переходы между этим и соседними состояниями.
5. Motion script — для 6 ключевых взаимодействий (§7) дай детальную спеку: timeline (мс), easing, ключевые кадры, какие свойства анимируются. Если применимо — Framer Motion код-сниппет.
6. Accessibility checklist — заполненный по §8 с указанием, где именно решение применяется.
7. Implementation map — короткая таблица «компонент → файл в проекте». Опираясь на существующую FSD-структуру (src/entities, src/features, src/shared, src/pages), укажи, какие файлы нужно создать/изменить.
8. Risks & open questions — что осталось неоднозначным, какие тесты UX-исследования стоит провести перед реализацией.

CONSTRAINTS — строго:
- Не предлагай светлую тему как основную. Тёмная — primary.
- Не нарушай стек (React 19, Tailwind v4, Radix, Framer Motion, dnd-kit, lucide-react). Никаких новых фреймворков.
- Не предлагай решений, требующих WebGL/Three.js.
- Не вставляй emoji в UI. В тексте rationale — тоже воздержись.
- Не выдавай «вода-маркетинг». Каждое утверждение должно поддерживать решение.
- Кириллицу в шрифтах учитывай.
- Любые цвета указывай и в HEX, и в OKLCH (для Tailwind v4).

QUALITY BAR
Уровень — Linear, Arc, Raycast, Vercel dashboard. Не Behance-«красиво», а функционально-красиво. Если у тебя есть выбор между «вау» и «читается за полсекунды» — выбирай второе.

OUTPUT FORMAT
Markdown. Используй заголовки H2/H3, таблицы, code-blocks для токенов и кода. Длинные перечни — таблицами, не bullet-простынёй. В конце короткое executive summary (≤150 слов) с TL;DR для product-менеджера.

START
Начинай с пункта 1 (rationale). Не задавай уточняющих вопросов — действуй на основе брифа. Если что-то критично неоднозначно — отметь это в §8 (open questions), но решение всё равно прими.
```

---

*Подготовлено для проекта Plug-I/O Rack Builder. Версия брифа: 1.0 · 2026-05-28.*
