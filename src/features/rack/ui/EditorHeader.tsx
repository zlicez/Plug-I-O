import * as Dialog from '@radix-ui/react-dialog';
import { toPng } from 'html-to-image';
import {
  CircleHelp,
  Download,
  Eraser,
  Image,
  Redo2,
  RotateCcw,
  Save,
  Undo2,
  Upload,
} from 'lucide-react';
import { useState, type ChangeEvent, type RefObject } from 'react';
import { useStore } from 'zustand';
import { RACK_SIZES } from '../../../entities/device/lib/device-utils';
import { localSessionRepository, parseSessionImport } from '../../../shared/lib/session-repository';
import { Button } from '../../../shared/ui/Button';
import { useRackStore } from '../model/use-rack-store';

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface EditorHeaderProps {
  captureRef: RefObject<HTMLDivElement | null>;
  onTour: () => void;
}

export function EditorHeader({ captureRef, onTour }: EditorHeaderProps) {
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const rackSize = useRackStore((state) => state.rackSize);
  const viewMode = useRackStore((state) => state.viewMode);
  const getSession = useRackStore((state) => state.getSession);
  const loadSession = useRackStore((state) => state.loadSession);
  const setRackSize = useRackStore((state) => state.setRackSize);
  const clearRack = useRackStore((state) => state.clearRack);
  const deviceCount = useRackStore((state) => state.installed.length);
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
    try {
      loadSession(parseSessionImport(await file.text()));
      announce('Session imported', file.name);
    } catch (error: unknown) {
      notify({
        level: 'error',
        title: 'Import failed',
        message: error instanceof Error ? error.message : 'Invalid session file.',
      });
    }
  };

  return (
    <header className="editor-header">
      <div className="editor-brand">
        <strong>Plug-I/O</strong>
        <span>RACK BUILDER</span>
      </div>
      <label className="rack-size">
        Frame
        <select
          onChange={(event) => setRackSize(Number(event.target.value) as typeof rackSize)}
          value={rackSize}
        >
          {RACK_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}U
            </option>
          ))}
        </select>
      </label>
      <div aria-label="Panel side" className="view-toggle" data-tour="view-toggle" role="group">
        {(['front', 'rear'] as const).map((mode) => (
          <button
            aria-pressed={viewMode === mode}
            className={viewMode === mode ? 'active' : ''}
            key={mode}
            onClick={() => setViewMode(mode)}
            type="button"
          >
            {mode}
          </button>
        ))}
        <RotateCcw aria-hidden size={14} />
      </div>
      <div className="history-controls">
        <Button
          aria-label="Undo"
          disabled={undoCount === 0}
          onClick={undo}
          size="icon"
          variant="ghost"
        >
          <Undo2 size={17} />
        </Button>
        <Button
          aria-label="Redo"
          disabled={redoCount === 0}
          onClick={redo}
          size="icon"
          variant="ghost"
        >
          <Redo2 size={17} />
        </Button>
        <Dialog.Root onOpenChange={setClearConfirmOpen} open={clearConfirmOpen}>
          <Dialog.Trigger asChild>
            <Button aria-label="Clear rack" disabled={deviceCount === 0} size="sm" variant="ghost">
              <Eraser size={15} /> Clear
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="confirm-dialog">
              <Dialog.Title>Clear current rack?</Dialog.Title>
              <Dialog.Description>
                Installed devices and patch cables will be removed. This action can be undone.
              </Dialog.Description>
              <div>
                <Dialog.Close asChild>
                  <Button variant="secondary">Cancel</Button>
                </Dialog.Close>
                <Button
                  onClick={() => {
                    clearRack();
                    setClearConfirmOpen(false);
                  }}
                  variant="danger"
                >
                  Clear rack
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <small>{undoCount}/50</small>
      </div>
      <nav className="editor-actions" data-tour="export">
        <Button onClick={onTour} size="icon" variant="ghost" aria-label="Open guided tour">
          <CircleHelp size={17} />
        </Button>
        <Button
          onClick={() => {
            localSessionRepository.save(getSession());
            announce('Session saved', 'Rack state stored locally.');
          }}
          size="sm"
          variant="secondary"
        >
          <Save size={15} /> Save
        </Button>
        <Button
          onClick={() =>
            download(
              JSON.stringify(getSession(), null, 2),
              'plug-io-session.json',
              'application/json',
            )
          }
          size="icon"
          variant="secondary"
          aria-label="Export JSON"
        >
          <Download size={16} />
        </Button>
        <label className="file-action" aria-label="Import JSON">
          <Upload size={16} />
          <input accept=".json,application/json" onChange={onImport} type="file" />
        </label>
        <Button
          aria-label="Export PNG"
          onClick={async () => {
            if (!captureRef.current) return;
            const image = await toPng(captureRef.current, {
              backgroundColor: '#0f0f10',
              pixelRatio: 2,
            });
            const link = document.createElement('a');
            link.download = 'plug-io-rack.png';
            link.href = image;
            link.click();
          }}
          size="icon"
          variant="secondary"
        >
          <Image size={16} />
        </Button>
      </nav>
    </header>
  );
}
