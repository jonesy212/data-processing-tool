"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDPOINT = void 0;
var axios_1 = require("axios");
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var socket_io_client_1 = require("socket.io-client");
var dataAnalysisUtils_1 = require("../../utils/dataAnalysisUtils");
exports.ENDPOINT = "http://your-backend-endpoint"; // Update with your actual backend endpoint
var useRealtimeData = function (initialData, updateCallback) {
    var _a = (0, react_1.useState)(initialData), realtimeData = _a[0], setRealtimeData = _a[1];
    var dispatch = (0, react_redux_1.useDispatch)(); // Initialize useDispatch hook
    (0, react_1.useEffect)(function () {
        var socket = (0, socket_io_client_1.default)(exports.ENDPOINT);
        socket.on("updateData", function (data, events, snapshotStore, dataItems) {
            // Call the provided updateCallback with the updated data, events, snapshotStore, and dataItems
            updateCallback(data, events, snapshotStore, dataItems);
            // Emit an event to trigger further updates, if needed
            socket.emit("realtimeUpdate", data);
        });
        socket.on("connect_error", function (error) {
            console.error("WebSocket connection error:", error);
            // Implement error handling, such as retry logic or showing an error message
            // For example, you can attempt to reconnect after a delay
            setTimeout(function () {
                socket.connect();
            }, 3000); // Retry connection after 3 seconds (adjust as needed)
        });
        socket.on("disconnect", function (reason) {
            console.log("WebSocket disconnected:", reason);
            // Implement logic for reconnection or notifying the user
            // You may want to check the reason for disconnection and handle accordingly
            if (reason === "io server disconnect") {
                // Automatic reconnection is attempted
            }
            else {
                // Manually attempt reconnection
                socket.connect();
            }
        });
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("/api/data")];
                    case 1:
                        response = _a.sent();
                        // Update the state with the new data
                        setRealtimeData(response.data);
                        // Synchronize the cache with the updated data
                        return [4 /*yield*/, axios_1.default.post("/api/synchronize_cache", {
                                preferences: response.data,
                            })];
                    case 2:
                        // Synchronize the cache with the updated data
                        _a.sent();
                        // Dispatch an action to update Redux store state
                        dispatch({ type: "UPDATE_REALTIME_DATA", payload: response.data });
                        // Emit the updated data to the frontend via WebSocket
                        socket.emit("updateData", response.data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error fetching or synchronizing data:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Initial fetch
        fetchData();
        // Interval for periodic updates
        var intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)
        return function () {
            // Cleanup: Stop the interval and disconnect WebSocket when the component unmounts
            clearInterval(intervalId);
            socket.disconnect();
        };
    }, [setRealtimeData, updateCallback]);
    return { realtimeData: realtimeData, fetchData: dataAnalysisUtils_1.fetchData };
};
// Define your update callback function
var updateCallback = function (events) {
    // Your update logic here
    // Perform any additional logic based on the updated events data
    // For example, you can directly use the updated events data
    Object.keys(events).forEach(function (eventId) {
        var calendarEvents = events[eventId];
        // Perform actions based on each calendar event
        calendarEvents.forEach(function (event) {
            // Example: Update UI or trigger notifications based on the event
            console.log("Updated event with ID ".concat(eventId, ":"), event);
        });
    });
};
exports.default = useRealtimeData;
updateCallback;
