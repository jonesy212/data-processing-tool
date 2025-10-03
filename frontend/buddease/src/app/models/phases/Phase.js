"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseImpl = void 0;
var PhaseImpl = /** @class */ (function () {
    function PhaseImpl(name, startDate, endDate, subPhases, component, hooks, data, description, title) {
        this.name = "";
        this.startDate = new Date();
        this.endDate = new Date();
        this.subPhases = [];
        // component: React.FC = () => <div>Phase Component</div>,
        this.hooks = {
            canTransitionTo: function () { return true; },
            handleTransitionTo: function () {},
            resetIdleTimeout: function () { return Promise.resolve(); },
            isActive: false,
        };
        this.title = "";
        this.description = "";
        this.duration = 0; // Duration of the phase in seconds
        this.lessons = [];
        this.name = name;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.subPhases = subPhases;
        this.hooks = hooks;
        this.data = data;
        this.description = description;
        this.component = component;
    }
    return PhaseImpl;
}());
exports.PhaseImpl = PhaseImpl;
