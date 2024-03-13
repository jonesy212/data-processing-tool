// UndoRedoStore.ts
import { action, observable } from 'mobx';

export class UndoRedoStore {
  @observable actions: any[] = [];
  @observable currentIndex: number = -1;

  @action
  public performAction(action: any) {
    // Perform action
    this.actions.splice(this.currentIndex + 1);
    this.actions.push(action);
    this.currentIndex++;
  }

  @action
  public undo() {
    if (this.currentIndex > -1) {
      this.actions[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  @action
  public redo() {
    if (this.currentIndex < this.actions.length - 1) {
      this.currentIndex++;
      this.actions[this.currentIndex].redo();
    }
  }
}
