import React from 'react';
import { Redo2, Undo2 } from 'lucide-react';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => (
  <div className="flex items-center gap-0.5">
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onUndo}
      disabled={!canUndo}
      aria-label="Undo"
      title="Undo (Ctrl+Z)"
      className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/10"
    >
      <Undo2 className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onRedo}
      disabled={!canRedo}
      aria-label="Redo"
      title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
      className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/10"
    >
      <Redo2 className="h-3.5 w-3.5" />
    </button>
  </div>
);
