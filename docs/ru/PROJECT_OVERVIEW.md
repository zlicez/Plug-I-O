# Обзор проекта

## Кратко о продукте

Plug-I/O Rack Builder - браузерный инструмент для планирования студийных рэков. Он помогает ответить на четыре ключевых вопроса:

1. Какие устройства установлены в рэке?
2. Где они физически помещаются?
3. Какие rear-panel порты можно соединить между собой?
4. Какие предупреждения нужно показать пользователю, чтобы схема коммутации не вводила в заблуждение?

Сейчас это полностью клиентское SPA без backend. Активная сессия хранится в `localStorage`, поддерживаются импорт/экспорт JSON и экспорт изображения рэка в PNG.

## Технологический стек

- React 19 + TypeScript.
- Vite 6 для dev-сервера и production build.
- React Router 7 для маршрутов `/` и `/editor`.
- Zustand + Immer + Zundo для состояния редактора, иммутабельных обновлений и undo/redo.
- dnd-kit для drag/drop установки устройств.
- Radix Dialog/Popover/Tooltip для доступных overlay-компонентов.
- Framer Motion для анимаций.
- Fuse.js для fuzzy search в библиотеке устройств.
- html-to-image для PNG export.
- Vitest + jsdom для unit-тестов.
- ESLint Airbnb + TypeScript + jsx-a11y, Prettier.

## Команды

| Команда              | Назначение                                                 |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Запускает Vite dev server.                                 |
| `npm run build`      | Запускает `tsc -b` и собирает production build через Vite. |
| `npm run typecheck`  | Проверяет TypeScript без emit.                             |
| `npm test`           | Один раз запускает все Vitest-тесты.                       |
| `npm run test:watch` | Запускает Vitest в watch mode.                             |
| `npm run lint`       | Запускает ESLint по `src/**/*.ts(x)`.                      |
| `npm run format`     | Форматирует проект через Prettier.                         |

## Runtime-точки входа

- `index.html` монтирует приложение в `#root`.
- `src/main.tsx` создает React root, оборачивает приложение в `StrictMode` и импортирует глобальные стили.
- `src/app/App.tsx` описывает маршруты:
  - `/` рендерит `LandingPage`.
  - `/editor` лениво загружает `EditorPage`.
- `ToastHost` всегда смонтирован под router, чтобы любые действия редактора могли показывать уведомления.

## Конфигурация сборки

`vite.config.ts` подключает React, Tailwind CSS v4, Vitest и manual vendor chunks:

- `react`
- `radix-ui`
- `motion`
- `drag-and-drop`
- `image-export`
- `icons`
- `state`

Разделение чанков полезно, потому что редактор тяжелый и сам маршрут `/editor` загружается лениво.

## Доменная модель

### Device

Определен в `src/entities/device/model/types.ts`.

`Device` описывает rackable-устройство:

- идентичность: `id`, `name`, `manufacturer`
- классификация: `category`, `tags`, `popularity`
- физическое размещение: `rackUnits`
- модель передней панели: controls, accent color, meter type
- модель задней панели: ports и verification metadata
- specs: необязательные технические поля

Поле `backPanel.verification` важно для доверия к данным. Оно показывает источник модели задней панели:

- `documented`: основано на конкретной документации/спецификации.
- `modeled`: смоделировано по классу оборудования.
- `configured`: поддерживается типами, но сейчас генератор каталога почти не использует это значение.

### Port

`Port` содержит:

- тип коннектора, например `xlr_analog`, `jack_trs`, `db25_dsub`, `ethercon`.
- направление: `in`, `out`, `thru`, `send`, `return`, `bidirectional`.
- протокол: analog, AES/EBU, S/PDIF, ADAT, Dante, MADI, AVB, MIDI, word clock, power и др.
- необязательные electrical/channel metadata: impedance, max level, sample rates, channel shape.
- необязательные `count` и `individualSockets`.

`count` без `individualSockets` означает агрегированный коннектор или многоканальный интерфейс. `count` вместе с `individualSockets` разворачивается в отдельные физические endpoints через `getConnectablePorts`.

### Rack Session

Определена в `src/features/rack/model/types.ts`.

```ts
interface RackSession {
  version: 1;
  rackSize: RackSize;
  installed: InstalledDevice[];
  cables: Cable[];
}
```

В session format и undo/redo попадают только `rackSize`, `installed` и `cables`. UI-состояния вроде filters, selection, hover и notifications намеренно не входят в переносимую сессию.

### Cable

`Cable` соединяет два endpoint:

- `from`: source instance/port.
- `to`: destination instance/port.
- `color`: вычисляется по protocol/connector источника.
- `notices`: warnings/info, зафиксированные в момент создания кабеля.

## Каталог устройств

`src/data/devices.ts` содержит генератор каталога и 59 catalog definitions. Генератор уменьшает повторение:

- `portsForProfile(profile, channels)` создает default rear-panel ports.
- `controlsFor(category, channels)` создает узнаваемые front-panel controls.
- `buildDevice(definition)` объединяет defaults, overrides, tags, specs, verification и popularity.

Текущий охват категорий:

- AD/DA converters, audio interfaces, Dante/MADI interfaces.
- Microphone preamps, compressors, EQs, gates, multiband dynamics.
- Reverbs/effects/delays.
- Patch bays: TRS, XLR, DB25, blank panels.
- Monitor controllers, summing mixers, word clocks.
- Power amps, power conditioners, DI/reamp devices.

## Persistence

`src/shared/lib/session-repository.ts` отвечает за local persistence:

- storage key: `plug-io:rack-session:v1`
- `localSessionRepository.load()`
- `localSessionRepository.save(session)`
- `parseSessionImport(content)`

Импортированная session сначала проходит структурную валидацию, затем sanitization в rack store против текущего каталога. Неизвестные устройства, overlapping placement, выход за высоту рэка, отсутствующие порты и invalid cables удаляются.

## Текущие границы продукта

Входит в scope:

- client-side rack editing.
- поиск и фильтрация устройств.
- front/rear визуализация рэка.
- валидация совместимости кабелей.
- local save, JSON import/export, PNG export.
- базовый guided tour.

Пока вне scope:

- аккаунты, команды, backend projects.
- cloud persistence.
- real-time collaboration.
- точная electrical simulation.
- расчет длины кабелей.
- full patchbay normalization modes.
- server-side image export.
