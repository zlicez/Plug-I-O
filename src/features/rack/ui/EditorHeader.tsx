import * as Dialog from '@radix-ui/react-dialog';
import { toPng } from 'html-to-image';
import {
  ChevronDown,
  CircleHelp,
  Download,
  Eraser,
  FileImage,
  FileJson,
  FileText,
  Pencil,
  Redo2,
  Save,
  Undo2,
  Upload,
} from 'lucide-react';
import {
  useState,
  type ChangeEvent,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react';
import { useStore } from 'zustand';
import { RACK_SIZES } from '../../../entities/device/lib/device-utils';
import { localSessionRepository, parseSessionImport } from '../../../shared/lib/session-repository';
import { cn } from '../../../shared/lib/cn';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Chip } from '../../../shared/ui/Chip';
import { Eyebrow } from '../../../shared/ui/Eyebrow';
import { Kbd } from '../../../shared/ui/Kbd';
import { Modal } from '../../../shared/ui/Modal';
import { Popover } from '../../../shared/ui/Popover';
import { Tooltip } from '../../../shared/ui/Tooltip';
import { useRackStore } from '../model/use-rack-store';

interface EditorHeaderProps {
  captureRef: RefObject<HTMLDivElement | null>;
  onTour: () => void;
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <rect
        fill="var(--bg)"
        height="18"
        rx="3"
        stroke="var(--accent)"
        strokeWidth="1.4"
        width="20"
        x="2"
        y="3"
      />
      <circle cx="8" cy="12" fill="var(--accent)" r="2.6" />
      <circle cx="16" cy="12" fill="none" r="2.6" stroke="var(--accent)" strokeWidth="1.4" />
      <line stroke="var(--accent)" strokeWidth="1.4" x1="10.6" x2="13.4" y1="12" y2="12" />
    </svg>
  );
}

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function EditorHeader({ captureRef, onTour }: EditorHeaderProps) {
  const [rackSizeOpen, setRackSizeOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const rackSize = useRackStore((state) => state.rackSize);
  const viewMode = useRackStore((state) => state.viewMode);
  const getSession = useRackStore((state) => state.getSession);
  const loadSession = useRackStore((state) => state.loadSession);
  const setRackSize = useRackStore((state) => state.setRackSize);
  const clearRack = useRackStore((state) => state.clearRack);
  const deviceCount = useRackStore((state) => state.installed.length);
  const cableCount = useRackStore((state) => state.cables.length);
  const setViewMode = useRackStore((state) => state.setViewMode);
  const notify = useRackStore((state) => state.notify);
  const undo = useRackStore((state) => state.undo);
  const redo = useRackStore((state) => state.redo);
  const undoCount = useStore(useRackStore.temporal, (state) => state.pastStates.length);
  const redoCount = useStore(useRackStore.temporal, (state) => state.futureStates.length);

  const announce = (title: string, message: string) =>
    notify({ level: 'info', title, message, expiresAt: Date.now() + 4000 });

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      loadSession(parseSessionImport(await file.text()));
      announce('Session imported', file.name);
    } catch (error: unknown) {
      notify({
        level: 'error',
        title: 'Import failed',
        message: error instanceof Error ? error.message : 'Invalid session file.',
      });
    } finally {
      setImporting(false);
      // reset input so the same file can be re-selected
      event.target.value = '';
    }
  };

  const handleSave = () => {
    localSessionRepository.save(getSession());
    notify({
      level: 'info',
      title: 'Session saved',
      message: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: Date.now() + 4000,
    });
  };

  const handleExport = async (format: 'json' | 'png' | 'pdf' | 'svg') => {
    setExportOpen(false);
    if (format === 'json') {
      download(JSON.stringify(getSession(), null, 2), 'plug-io-session.json', 'application/json');
      announce('Exported', 'Saved as plug-io-session.json');
      return;
    }
    if (format === 'png') {
      if (!captureRef.current) return;
      const image = await toPng(captureRef.current, {
        backgroundColor: '#0f0f10',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'plug-io-rack.png';
      link.href = image;
      link.click();
      announce('Exported', 'Saved as plug-io-rack.png');
      return;
    }
    notify({
      level: 'info',
      title: 'Coming soon',
      message: `${format.toUpperCase()} export is on the roadmap.`,
      expiresAt: Date.now() + 4000,
    });
  };

  const rackCm = Math.round((rackSize * 44.45) / 10);

  return (
    <header
      className={cn(
        'relative z-30 flex h-12 shrink-0 items-center px-3',
        'border-b border-line bg-surface text-copy',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-r border-line pr-4">
        <Logo size={22} />
        <span className="text-14 font-semibold tracking-[-0.01em]">Plug-I/O</span>
        <Chip>beta</Chip>
      </div>

      {/* Rack name + size */}
      <div className="flex items-center gap-2 border-r border-line px-3">
        <div className="flex items-center gap-1.5">
          <Eyebrow>Rack</Eyebrow>
          <span className="text-13 font-medium">Studio A · Tracking</span>
          <button
            aria-label="Rename rack"
            className="rounded-1 p-0.5 text-muted-2 hover:bg-control hover:text-copy"
            type="button"
          >
            <Pencil size={12} />
          </button>
        </div>
        <Popover
          align="start"
          onOpenChange={setRackSizeOpen}
          open={rackSizeOpen}
          trigger={
            <Chip aria-label={`Rack size ${rackSize}U, ${rackCm} cm`} asButton>
              {rackSize}U
              <ChevronDown size={10} />
            </Chip>
          }
          width={140}
        >
          <div className="flex flex-col">
            {RACK_SIZES.map((size) => (
              <button
                className={cn(
                  'flex items-center justify-between rounded-1 px-2.5 py-1.5 font-mono text-12',
                  size === rackSize
                    ? 'bg-accent-soft text-accent'
                    : 'text-copy-2 hover:bg-control',
                )}
                key={size}
                onClick={() => {
                  setRackSize(size);
                  setRackSizeOpen(false);
                }}
                type="button"
              >
                <span>{size}U</span>
                <span className="text-10 text-muted-2">{Math.round((size * 44.45) / 10)} cm</span>
              </button>
            ))}
          </div>
        </Popover>
      </div>

      {/* Front/Rear segmented toggle */}
      <div className="flex items-center gap-2 pl-3" data-tour="view-toggle">
        <div className="flex gap-1 rounded-2 border border-line-2 bg-bg-2 p-1">
          {(['front', 'rear'] as const).map((mode) => (
            <button
              aria-pressed={viewMode === mode}
              className={cn(
                'inline-flex h-6 items-center justify-center rounded-1 px-3 font-mono text-11 leading-none tracking-[0.08em]',
                'transition-colors duration-150 ease-standard',
                viewMode === mode
                  ? 'bg-accent text-accent-text font-semibold'
                  : 'font-medium text-muted hover:text-copy',
              )}
              key={mode}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-1 font-mono text-11 text-muted-2 lg:flex">
          <Kbd>V</Kbd>
          <span>/</span>
          <Kbd>R</Kbd>
        </div>
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-line pr-3">
        <Tooltip
          content={
            undoCount > 0 ? (
              <span>
                Undo last action <Kbd>⌘Z</Kbd>
              </span>
            ) : (
              'Nothing to undo'
            )
          }
        >
          <Button
            aria-label="Undo"
            className="relative"
            disabled={undoCount === 0}
            onClick={undo}
            size="icon"
            variant="ghost"
          >
            <Undo2 size={14} />
            {undoCount > 0 ? (
              <Badge className="absolute -bottom-0.5 -right-0.5" tone="default">
                {undoCount}
              </Badge>
            ) : null}
          </Button>
        </Tooltip>
        <Tooltip content={redoCount > 0 ? 'Redo' : 'Nothing to redo'}>
          <Button
            aria-label="Redo"
            disabled={redoCount === 0}
            onClick={redo}
            size="icon"
            variant="ghost"
          >
            <Redo2 size={14} />
          </Button>
        </Tooltip>
        <Tooltip content={deviceCount === 0 ? 'Rack is empty' : 'Clear rack'}>
          <Button
            aria-label="Clear rack"
            disabled={deviceCount === 0}
            onClick={() => setClearConfirmOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Eraser size={14} />
          </Button>
        </Tooltip>
        <span className="font-mono text-11 text-muted-2">{undoCount}/50</span>
      </div>

      {/* Save / Export / Help */}
      <nav className="flex items-center gap-1.5 pl-3" data-tour="export">
        <Button onClick={handleSave} size="sm">
          <Save size={13} />
          <span>Save</span>
          <Kbd className="ml-1 h-4 text-10">⌘S</Kbd>
        </Button>
        <Button onClick={() => setExportOpen(true)} size="sm">
          <Download size={13} />
          <span>Export</span>
        </Button>
        <label
          aria-label="Import JSON"
          className={cn(
            'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-2 ' +
              'border border-transparent text-copy-2 transition-colors duration-150 ease-standard ' +
              'hover:bg-control hover:text-copy hover:border-line-2',
            importing && 'opacity-50 pointer-events-none',
          )}
        >
          <Upload size={14} />
          <input
            accept=".json,application/json"
            className="sr-only"
            onChange={onImport}
            type="file"
          />
        </label>
        <Tooltip content="Keyboard shortcuts (?)">
          <Button
            aria-label="Open keyboard shortcuts"
            onClick={() => setShortcutsOpen(true)}
            size="icon"
            variant="ghost"
          >
            <CircleHelp size={14} />
          </Button>
        </Tooltip>
      </nav>

      <ClearRackModal
        cableCount={cableCount}
        deviceCount={deviceCount}
        onConfirm={() => {
          clearRack();
          setClearConfirmOpen(false);
        }}
        onOpenChange={setClearConfirmOpen}
        open={clearConfirmOpen}
      />
      <ExportModal
        onOpenChange={setExportOpen}
        onSelect={(format) => void handleExport(format)}
        open={exportOpen}
      />
      <ShortcutsModal
        onOpenChange={setShortcutsOpen}
        onReplayTour={() => {
          setShortcutsOpen(false);
          onTour();
        }}
        open={shortcutsOpen}
      />
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Clear-rack confirm
// ─────────────────────────────────────────────────────────────
function ClearRackModal({
  open,
  onOpenChange,
  onConfirm,
  deviceCount,
  cableCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deviceCount: number;
  cableCount: number;
}) {
  return (
    <Modal
      eyebrow="Confirm"
      footer={
        <>
          <Dialog.Close asChild>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button onClick={onConfirm} variant="danger">
            Clear rack
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title="Clear current rack?"
      width={420}
    >
      <p className="text-13 leading-snug text-muted">
        Installed devices and patch cables will be removed. You can undo this from the toolbar.
      </p>
      <div className="mt-3 flex gap-2">
        <Chip>{deviceCount} devices</Chip>
        <Chip>{cableCount} cables</Chip>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Export menu
// ─────────────────────────────────────────────────────────────
interface ExportOption {
  fmt: 'json' | 'png' | 'pdf' | 'svg';
  name: string;
  desc: string;
  icon: ComponentType<{ size?: number }>;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    fmt: 'json',
    name: 'JSON',
    desc: 'Machine-readable session for backup or sharing',
    icon: FileJson,
  },
  { fmt: 'png', name: 'PNG · 2×', desc: 'Flat image of the current view', icon: FileImage },
  {
    fmt: 'pdf',
    name: 'PDF spec sheet',
    desc: 'A4 print with patch list, port table and BOM',
    icon: FileText,
  },
  { fmt: 'svg', name: 'SVG', desc: 'Vector — editable in Figma / Illustrator', icon: FileText },
];

function ExportModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (format: ExportOption['fmt']) => void;
}) {
  return (
    <Modal
      eyebrow="Export"
      onOpenChange={onOpenChange}
      open={open}
      title="Save the rack as…"
      width={480}
    >
      <div className="flex flex-col gap-1">
        {EXPORT_OPTIONS.map((option) => (
          <button
            className={cn(
              'flex items-center gap-3 rounded-3 border border-transparent p-3 text-left',
              'hover:bg-surface-2 hover:border-line transition-colors duration-150 ease-standard',
            )}
            key={option.fmt}
            onClick={() => onSelect(option.fmt)}
            type="button"
          >
            <div className="grid h-9 w-9 place-items-center rounded-2 border border-line bg-surface-2 text-accent">
              <option.icon size={16} />
            </div>
            <div className="flex-1">
              <div className="text-13 font-medium text-copy">{option.name}</div>
              <div className="mt-0.5 text-11 text-muted">{option.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Shortcuts modal
// ─────────────────────────────────────────────────────────────
interface ShortcutGroup {
  title: string;
  items: Array<[label: string, key: ReactNode]>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'View',
    items: [
      ['Front view', <Kbd key="v">V</Kbd>],
      ['Rear view', <Kbd key="r">R</Kbd>],
      [
        'Toggle view',
        <Kbd key="f">F</Kbd>,
      ],
    ],
  },
  {
    title: 'Library',
    items: [
      [
        'Quick search',
        <Kbd key="cmdk">⌘K</Kbd>,
      ],
      ['Toggle grid / list', <Kbd key="g">G</Kbd>],
    ],
  },
  {
    title: 'Editing',
    items: [
      ['Undo', <Kbd key="z">⌘Z</Kbd>],
      [
        'Redo',
        <Kbd key="y">⌘Y</Kbd>,
      ],
      ['Remove selection', <Kbd key="del">Del</Kbd>],
      [
        'Cancel cable / close',
        <Kbd key="esc">Esc</Kbd>,
      ],
    ],
  },
  {
    title: 'File',
    items: [
      ['Save session', <Kbd key="s">⌘S</Kbd>],
      ['Export', <Kbd key="e">⌘E</Kbd>],
      ['This help', <Kbd key="q">?</Kbd>],
    ],
  },
];

function ShortcutsModal({
  open,
  onOpenChange,
  onReplayTour,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplayTour: () => void;
}) {
  return (
    <Modal
      eyebrow="Keyboard"
      footer={<Button onClick={onReplayTour}>Replay guided tour</Button>}
      onOpenChange={onOpenChange}
      open={open}
      title="Shortcuts"
      width={540}
    >
      <div className="grid grid-cols-2 gap-x-7 gap-y-6">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title}>
            <Eyebrow className="mb-2.5">{group.title}</Eyebrow>
            <div className="flex flex-col gap-1.5">
              {group.items.map(([label, key]) => (
                <div className="flex items-center justify-between text-12" key={label}>
                  <span className="text-copy-2">{label}</span>
                  {key}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
