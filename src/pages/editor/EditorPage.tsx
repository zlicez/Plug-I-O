import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Library, Trash2, X } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode, useRef, useState } from 'react';
import { devices } from '../../data/devices';
import { getDeviceById } from '../../entities/device/lib/device-utils';
import type { Device } from '../../entities/device/model/types';
import { FrontPanelPreview } from '../../entities/device/ui/FrontPanelSvg';
import { DeviceInfoPanel } from '../../features/devices/ui/DeviceInfoPanel';
import { DeviceLibrary } from '../../features/devices/ui/DeviceLibrary';
import { EditorTour } from '../../features/onboarding/ui/EditorTour';
import { useEditorCommands } from '../../features/rack/lib/use-editor-commands';
import { useSessionPersistence } from '../../features/rack/lib/use-session-persistence';
import { useRackStore } from '../../features/rack/model/use-rack-store';
import { EditorHeader } from '../../features/rack/ui/EditorHeader';
import { RackCanvas } from '../../features/rack/ui/RackCanvas';
import { RackConfigurator } from '../../features/rack/ui/RackConfigurator';
import { StatusBar } from '../../features/rack/ui/StatusBar';
import { Button } from '../../shared/ui/Button';

interface DragItem {
  device: Device;
  instanceId?: string;
}

function extractDragItem(event: DragStartEvent): DragItem | null {
  const data = event.active.data.current;
  if (!data || typeof data.kind !== 'string') return null;
  if (data.kind === 'library' && typeof data.deviceId === 'string') {
    const device = getDeviceById(devices, data.deviceId);
    return device ? { device } : null;
  }
  if (data.kind === 'installed' && typeof data.instanceId === 'string') {
    const instance = useRackStore
      .getState()
      .installed.find((item) => item.instanceId === data.instanceId);
    const device = instance && getDeviceById(devices, instance.deviceId);
    return device ? { device, instanceId: data.instanceId } : null;
  }
  return null;
}

function RackTrashTarget({ visible }: { visible: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'rack-trash' });
  if (!visible) return null;
  return (
    <div className={`rack-trash ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
      <Trash2 size={25} />
    </div>
  );
}

function Workspace() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [tourRequest, setTourRequest] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const placeDevice = useRackStore((state) => state.placeDevice);
  const moveDevice = useRackStore((state) => state.moveDevice);
  const removeDevice = useRackStore((state) => state.removeDevice);
  useEditorCommands();
  useSessionPersistence();

  const onDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === 'rack-trash' && draggedItem?.instanceId) {
      removeDevice(draggedItem.instanceId);
      setDraggedItem(null);
      return;
    }
    const slot = event.over?.data.current?.slot;
    if (typeof slot === 'number' && draggedItem) {
      if (draggedItem.instanceId) moveDevice(draggedItem.instanceId, slot);
      else placeDevice(draggedItem.device.id, slot);
    }
    setDraggedItem(null);
  };

  return (
    <div className="editor-page">
      <EditorHeader
        captureRef={captureRef}
        onTour={() => setTourRequest((current) => current + 1)}
      />
      <DndContext
        onDragCancel={() => setDraggedItem(null)}
        onDragEnd={onDragEnd}
        onDragStart={(event) => setDraggedItem(extractDragItem(event))}
        sensors={sensors}
      >
        <main className="editor-workspace">
          <DeviceLibrary
            className={libraryOpen ? 'is-open' : undefined}
            onDeviceAdded={() => setLibraryOpen(false)}
          />
          <section className="rack-workspace" aria-label="Rack canvas">
            <RackCanvas draggedItem={draggedItem} ref={captureRef} />
            <RackTrashTarget visible={Boolean(draggedItem?.instanceId)} />
            <Button
              aria-controls="device-library"
              aria-expanded={libraryOpen}
              className="mobile-library-toggle"
              onClick={() => setLibraryOpen((open) => !open)}
              variant="secondary"
            >
              {libraryOpen ? <X size={16} /> : <Library size={16} />}
              {libraryOpen ? 'Close' : 'Devices'}
            </Button>
          </section>
          <DeviceInfoPanel />
        </main>
        <DragOverlay>
          {draggedItem && (
            <div className="rack-drag-overlay">
              <FrontPanelPreview device={draggedItem.device} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <StatusBar />
      <RackConfigurator />
      <EditorTour request={tourRequest} />
    </div>
  );
}

class EditorErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  public state = { failed: false };

  public static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    // Rendering failures are reported while the persisted session remains recoverable.
    // eslint-disable-next-line no-console
    console.error('Editor render failure', error, info);
  }

  public render() {
    if (this.state.failed) {
      return (
        <main className="editor-failure">
          <h1>Rack editor unavailable</h1>
          <p>The session could not be rendered. Reload to reopen the saved rack.</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Reload editor
          </Button>
        </main>
      );
    }
    return this.props.children;
  }
}

export function EditorPage() {
  return (
    <EditorErrorBoundary>
      <Workspace />
    </EditorErrorBoundary>
  );
}
