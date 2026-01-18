// CustomDragObject.tsx
class CustomDragObject {
    private element: HTMLElement;
    private initialX: number;
    private initialY: number;
  
    constructor(elementId: string) {
      this.element = document.getElementById(elementId)!;
      this.initialX = 0;
      this.initialY = 0;
      this.initializeDrag();
    }
  
    private initializeDrag() {
      this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
      document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  
    private onMouseDown(event: MouseEvent) {
      event.preventDefault();
      this.initialX = event.clientX;
      this.initialY = event.clientY;
      document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
  
    private onMouseMove(event: MouseEvent) {
      event.preventDefault();
      const deltaX = event.clientX - this.initialX;
      const deltaY = event.clientY - this.initialY;
      const newLeft = this.element.offsetLeft + deltaX;
      const newTop = this.element.offsetTop + deltaY;
      this.element.style.left = newLeft + "px";
      this.element.style.top = newTop + "px";
      this.initialX = event.clientX;
      this.initialY = event.clientY;
    }
  
    private onMouseUp() {
      document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    }
  }
  
  // Usage example:
  const customDragObject = new CustomDragObject("yourElementId");
  