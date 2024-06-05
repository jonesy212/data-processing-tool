import { makeAutoObservable } from 'mobx';
import { useState } from 'react';

const useUndoRedoStore = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const performAction = (action: any) => {
    setActions((prevActions) => {
      const newActions = [...prevActions.slice(0, currentIndex + 1), action];
      setCurrentIndex(newActions.length - 1);
      return newActions;
    });
  };

  const undo = () => {
    if (currentIndex > -1) {
      actions[currentIndex].undo();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < actions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      actions[currentIndex + 1].redo();
    }
  };

  const store = makeAutoObservable({
    actions,
    currentIndex,
    performAction,
    undo,
    redo,
  });

  return store;
};

export { useUndoRedoStore };
