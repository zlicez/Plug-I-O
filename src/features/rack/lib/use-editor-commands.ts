import { useEffect } from 'react';
import { useRackStore } from '../model/use-rack-store';

export function useEditorCommands() {
  const selected = useRackStore((state) => state.selectedDeviceId);
  const selectedCable = useRackStore((state) => state.selectedCableId);
  const remove = useRackStore((state) => state.removeDevice);
  const deleteCable = useRackStore((state) => state.deleteCable);
  const undo = useRackStore((state) => state.undo);
  const redo = useRackStore((state) => state.redo);
  const viewMode = useRackStore((state) => state.viewMode);
  const setViewMode = useRackStore((state) => state.setViewMode);
  const cancel = useRackStore((state) => state.cancelCable);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const inField =
        event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      if (!inField && event.key.toLowerCase() === 'f') {
        setViewMode(viewMode === 'front' ? 'rear' : 'front');
      }
      if (!inField && (event.key === 'Delete' || event.key === 'Backspace')) {
        if (selectedCable) deleteCable(selectedCable);
        else if (selected) remove(selected);
      }
      if (event.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cancel, deleteCable, redo, remove, selected, selectedCable, setViewMode, undo, viewMode]);
}
