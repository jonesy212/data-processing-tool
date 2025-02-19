"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useRealtimeData_1 = require("../components/hooks/commHooks/useRealtimeData");
var CalendarEvent_1 = require("../components/state/stores/CalendarEvent");
var initialData = {};
var realtimeData = (0, useRealtimeData_1.default)(initialData, CalendarEvent_1.updateCallback);
// Rest of the code remains unchanged...
