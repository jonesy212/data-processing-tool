import useIdleTimeout from "../components/hooks/idleTimeoutHooks";

const idleTimeout = useIdleTimeout("IdleTimeout", {
    isActive: false,
    intervalId: null, // Change type to NodeJS.Timeout | null
    idleTimeoutDuration: 5000, // Example duration, set it as needed
    idleTimeoutId: null, // Set to null initially

    animateIn: function (selector: string): void {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('animate-in');
        } else {
            console.error('Element not found');
        }
    },

    startIdleTimeout: function (): void {
        if (this.intervalId) clearInterval(this.intervalId); // Clear any existing intervals
        this.intervalId = setInterval(() => {
            this.animateIn('#idle-timeout-container');
        }, this.idleTimeoutDuration);
    },

    toggleActivation: async function (): Promise<boolean> {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.startAnimation();
            this.startIdleTimeout(); // Start the idle timeout if activated
        } else {
            this.stopAnimation();
        }
        return Promise.resolve(this.isActive);
    },

    startAnimation: function (): void {
        // Select the element you want to animate
        const element = document.querySelector('#idle-timeout-container');

        if (element) {
            // Add the animation class to start the animation
            element.classList.add('animate-in');

            // Optional: Set a timeout to remove the class after the animation duration
            setTimeout(() => {
                element.classList.remove('animate-in'); // Remove class after animation
            }, 1000); // Adjust the duration to match your CSS animation duration
        } else {
            console.error('Element not found for animation');
        }
    },

    stopAnimation: function (): void {
        this.isActive = false;
        if (this.intervalId) clearInterval(this.intervalId); // Clear the interval when stopping
        this.intervalId = null; // Reset intervalId
    },

    resetIdleTimeout: function (): Promise<void> {
        this.stopAnimation(); // Stop any active animation
        this.startIdleTimeout(); // Restart the idle timeout
        return Promise.resolve();
    }
});

export { idleTimeout }