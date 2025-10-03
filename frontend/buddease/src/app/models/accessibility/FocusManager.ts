class FocusManager {
    private static instance: FocusManager;
    private focusableElements: HTMLElement[];
  
    private constructor() {
      this.focusableElements = [];
      document.addEventListener("keydown", this.handleKeyDown);
    }
  
    public static getInstance(): FocusManager {
      if (!FocusManager.instance) {
        FocusManager.instance = new FocusManager();
      }
      return FocusManager.instance;
    }
  
    public addFocusableElement(element: HTMLElement) {
      this.focusableElements.push(element);
    }
  
    public removeFocusableElement(element: HTMLElement) {
      const index = this.focusableElements.indexOf(element);
      if (index !== -1) {
        this.focusableElements.splice(index, 1);
      }
    }
  
    private handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        this.manageTabFocus(event);
      }
    };
  
    private manageTabFocus(event: KeyboardEvent) {
      const focusedElement = document.activeElement as HTMLElement;
      const lastIndex = this.focusableElements.length - 1;
  
      if (event.shiftKey && focusedElement === this.focusableElements[0]) {
        // If shift key is pressed and the currently focused element is the first focusable element
        event.preventDefault();
        this.focusableElements[lastIndex].focus();
      } else if (!event.shiftKey && focusedElement === this.focusableElements[lastIndex]) {
        // If shift key is not pressed and the currently focused element is the last focusable element
        event.preventDefault();
        this.focusableElements[0].focus();
      }
    }
  }
  
  const focusManagerInstance = FocusManager.getInstance();
  export default focusManagerInstance;
  