# Plug-I/O Rack Builder

## EN

Plug-I/O is a browser-based studio rack planning tool. It lets a user choose a rack frame, add real or modeled audio devices, switch between front and rear views, patch rear-panel ports, validate connector/protocol compatibility, and export the result as JSON or PNG.

## RU

Plug-I/O - браузерный инструмент для планирования студийных рэков. Он позволяет выбрать размер рэка, добавить реальные или смоделированные устройства, переключаться между front/rear view, соединять rear-panel порты, проверять совместимость коннекторов/протоколов и экспортировать результат в JSON или PNG.

## Quick Start / Быстрый старт

```bash
npm install
npm run dev
```

Checks / проверки:

```bash
npm run typecheck
npm test
npm run build
```

The app runs through Vite and opens on `/`. The editor is lazy-loaded at `/editor`.

Приложение запускается через Vite и открывается на `/`. Редактор лениво загружается на `/editor`.

## Documentation / Документация

Language index:

- [Documentation index](docs/README.md)

English:

- [Project Overview](docs/en/PROJECT_OVERVIEW.md)
- [Architecture](docs/en/ARCHITECTURE.md)
- [Function Reference](docs/en/FUNCTION_REFERENCE.md)
- [Product Flows](docs/en/PRODUCT_FLOWS.md)
- [QA, Risks, and Backlog](docs/en/QA_RISKS_BACKLOG.md)

Русский:

- [Обзор проекта](docs/ru/PROJECT_OVERVIEW.md)
- [Архитектура](docs/ru/ARCHITECTURE.md)
- [Справочник функций](docs/ru/FUNCTION_REFERENCE.md)
- [Продуктовые сценарии](docs/ru/PRODUCT_FLOWS.md)
- [QA, риски и backlog](docs/ru/QA_RISKS_BACKLOG.md)

## Source Map / Карта исходников

```text
src/main.tsx                  React bootstrap
src/app/App.tsx               routes, tooltip provider, toast host
src/pages/landing             landing page
src/pages/editor              editor shell, drag/drop orchestration, error boundary
src/features/rack             rack state, commands, canvas, header, configurator
src/features/devices          device library, filters, inspector
src/features/patchbay         rear panel, port geometry, cable routing, patch status
src/features/onboarding       guided tour
src/entities/device           device types, utilities, front/rear visual primitives
src/entities/cable            cable types and validation rules
src/data/devices.ts           device catalog generator and 59 catalog definitions
src/shared                    geometry constants, UI primitives, session repository
qa                            Playwright-style exploratory scripts and screenshots
```

## Current Product Shape / Текущее состояние продукта

The project is client-only: rack sessions live in `localStorage`, JSON export/import is local, and all validation runs in the browser. There is no backend, auth, collaboration layer, or remote project storage yet.

Проект полностью клиентский: rack sessions хранятся в `localStorage`, JSON export/import работает локально, вся validation выполняется в браузере. Backend, auth, collaboration layer и remote project storage пока отсутствуют.
