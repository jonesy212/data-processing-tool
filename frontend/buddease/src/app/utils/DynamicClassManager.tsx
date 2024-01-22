import { CustomDAppAdapter } from "../components/web3/dAppAdapter/DApp";
import YourClass from "./YourClass";

class DynamicClassManager<T extends YourClass> {
    private activeClass: T;

    constructor(initialClass: new (config: any) => T) {
        // Assuming any type for the configuration, replace with the actual type if available
        this.activeClass = new initialClass({});
    }

    setActiveClass(newClass: new (config: any) => T) {
        this.activeClass = new newClass({});
    }

    executeActiveClassMethod() {
        if (this.activeClass) {
            this.activeClass.enableRealtimeCollaboration().enableChatFunctionality();
            // Call other methods as needed
        } else {
            console.error("No active class set.");
        }
    }
}

export default DynamicClassManager;
// Example usage:
const dynamicClassManager = new DynamicClassManager(CustomDAppAdapter);
dynamicClassManager.executeActiveClassMethod();
