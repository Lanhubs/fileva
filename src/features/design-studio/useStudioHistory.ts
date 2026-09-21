import { useState, useRef, useEffect, useCallback } from 'react';
import { DesignProject } from './types';

export function useStudioHistory(
  project: DesignProject,
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>
) {
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null);

  const historyRef = useRef<Array<DesignProject>>([]);
  const historyIndexRef = useRef<number>(-1);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize history on mount or when project is loaded
  useEffect(() => {
    if (historyRef.current.length === 0 && project) {
      historyRef.current = [JSON.parse(JSON.stringify(project))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [project]);

  const showFeedback = (message: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setHistoryFeedback(message);
    feedbackTimeoutRef.current = setTimeout(() => {
      setHistoryFeedback(null);
    }, 1200);
  };

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback(
    (newProject: DesignProject) => {
      try {
        const cloned = JSON.parse(JSON.stringify(newProject));
        const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
        trimmed.push(cloned);
        if (trimmed.length > 50) trimmed.shift();
        historyRef.current = trimmed;
        historyIndexRef.current = trimmed.length - 1;
        updateUndoRedoState();
      } catch (err) {
        console.error('Failed to push history snapshot:', err);
      }
    },
    [updateUndoRedoState]
  );

  const recordSnapshot = useCallback(
    (currentProject: DesignProject) => {
      const last = historyRef.current[historyIndexRef.current];
      if (!last || JSON.stringify(last) !== JSON.stringify(currentProject)) {
        pushHistory(currentProject);
      }
    },
    [pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      if (prev) {
        setProject(JSON.parse(JSON.stringify(prev)));
        updateUndoRedoState();
        showFeedback('Undo');
      }
    }
  }, [setProject, updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      if (next) {
        setProject(JSON.parse(JSON.stringify(next)));
        updateUndoRedoState();
        showFeedback('Redo');
      }
    }
  }, [setProject, updateUndoRedoState]);

  return {
    canUndo,
    canRedo,
    historyFeedback,
    pushHistory,
    recordSnapshot,
    handleUndo,
    handleRedo,
  };
}

