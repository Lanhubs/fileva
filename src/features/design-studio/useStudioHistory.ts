import { useState, useRef, useEffect, useCallback } from 'react';
import { DesignProject } from './types';

export function useStudioHistory(
  project: DesignProject,
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>
) {
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const historyRef = useRef<Array<DesignProject>>([]);
  const historyIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [project];
      historyIndexRef.current = 0;
    }
  }, []);

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback(
    (newProject: DesignProject) => {
      const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
      trimmed.push(newProject);
      if (trimmed.length > 30) trimmed.shift();
      historyRef.current = trimmed;
      historyIndexRef.current = trimmed.length - 1;
      updateUndoRedoState();
    },
    [updateUndoRedoState]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      if (prev) {
        setProject(prev);
        updateUndoRedoState();
      }
    }
  }, [setProject, updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      if (next) {
        setProject(next);
        updateUndoRedoState();
      }
    }
  }, [setProject, updateUndoRedoState]);

  return {
    canUndo,
    canRedo,
    pushHistory,
    handleUndo,
    handleRedo,
  };
}
