"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotStore = void 0;
var NotificationContext_1 = require("@/app/components/support/NotificationContext");
var retrieveSnapshotData_1 = require("@/app/utils/retrieveSnapshotData");
var mobx_1 = require("mobx");
var react_1 = require("react");
var AuthContext_1 = require("../auth/AuthContext");
var ShowToast_1 = require("../models/display/ShowToast");
var NotificationMessages_1 = require("../support/NotificationMessages");
var NotificationProvider_1 = require("../support/NotificationProvider");
var SnapshotConfig_1 = require("./SnapshotConfig");
var notify = (0, NotificationContext_1.useNotification)().notify;
// Define a helper function to create a typed snapshot object
var createTypedSnapshot = function (taskId, tasks, notify) {
    var _a;
    var snapshot = new SnapshotStore((_a = {
            key: "example_key",
            initialState: {},
            snapshotData: function () { return ({ snapshot: [] }); },
            createSnapshot: function () { }
        },
        _a[taskId] = tasks,
        _a.clearSnapshots = function () { },
        _a.snapshots = [{ snapshot: [] }],
        _a.subscribers = [],
        _a.notify = notify, // Provide the notify function
        _a.configureSnapshotStore = function (config) { },
        _a.createSnapshotSuccess = function () { },
        _a.createSnapshotFailure = function (error) { },
        _a.onSnapshot = function (snapshot) { },
        _a.snapshot = function () { return Promise.resolve({ snapshot: [] }); },
        _a.initSnapshot = function () { },
        _a.clearSnapshot = function () { },
        _a.updateSnapshot = function () { return Promise.resolve({ snapshot: [] }); },
        _a.getSnapshots = function () { return [{ snapshot: [] }]; },
        _a.takeSnapshot = function (snapshot) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ({ snapshot: [snapshot] })];
        }); }); },
        _a.getSnapshot = function (snapshot) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, [snapshot]];
        }); }); }, // Return the correct format
        _a.getAllSnapshots = function (data, snapshots) { return [snapshot]; },
        _a.takeSnapshotSuccess = function () { }, // Adjust the signature
        _a.updateSnapshotFailure = function (payload) { },
        _a.takeSnapshotsSuccess = function (snapshots) { },
        _a.fetchSnapshot = function () { },
        _a.updateSnapshotSuccess = function () { },
        _a.updateSnapshotsSuccess = function (snapshotData) { },
        _a.fetchSnapshotSuccess = function (snapshotData) { },
        _a.batchUpdateSnapshots = function (subscribers, snapshot) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, [{ snapshot: [] }]];
        }); }); },
        _a.batchUpdateSnapshotsSuccess = function (subscribers, snapshots) { return [{ snapshots: snapshots }]; },
        _a.batchUpdateSnapshotsRequest = function (snapshotData) { return ({
            subscribers: [],
            snapshots: [],
        }); },
        _a.batchFetchSnapshotsRequest = function (snapshotData) {
            return function (subscribers, snapshots) { return ({
                subscribers: [],
                snapshots: [],
            }); };
        },
        _a.batchFetchSnapshots = function (subscribers, snapshots) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ({ subscribers: subscribers, snapshots: snapshots })];
        }); }); },
        _a.batchFetchSnapshotsSuccess = function (subscribers, snapshot) { return snapshot; },
        _a.batchFetchSnapshotsFailure = function (payload) { },
        _a.batchUpdateSnapshotsFailure = function (payload) { },
        _a.notifySubscribers = function () { return ({}); },
        _a[Symbol.iterator] = function () {
            return ({});
        },
        _a), notify);
    return snapshot;
};
var snapshotFunction = function (subscribers, snapshot) {
    snapshot.forEach(function (s) {
        subscribers.forEach(function (sub) {
            // Assuming you have a method or property called `getData()` on the `SnapshotStore` class
            var data = sub.getData(); // Adjust this line according to the actual method or property
            // Now you can use `data` as needed
        });
    });
};
//todo update Implementation
var setNotificationMessage = function (message) {
    // Implementation of setNotificationMessage
    // Check if the notification context is available
    if (NotificationProvider_1.notificationStore && NotificationProvider_1.notificationStore.notify) {
        // Notify with the provided message
        NotificationProvider_1.notificationStore.notify("privateSetNotificationMessageSuccess", message, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
    }
};
var SnapshotStore = /** @class */ (function () {
    function SnapshotStore(config, notify) {
        var _this = this;
        this.creatSnapshot = function () { };
        this.snapshots = [];
        this.subscribers = [];
        this.getAllSnapshots = function (data, snapshots) {
            // Iterate over each snapshot in the provided array
            for (var _i = 0, snapshots_1 = snapshots; _i < snapshots_1.length; _i++) {
                var snapshot = snapshots_1[_i];
                // Extract the 'data' property from the nested snapshot
                var extractedData = snapshot.data.data;
                // Process each snapshot data and pass it to the subscribers
                data(_this.subscribers, snapshots);
            }
            // Return the original array of snapshots
            return snapshots;
        };
        this.key = config.key;
        this.state = config.initialState; // Adjusted assignment here
        this.notify = notify; // Assign the notify function
        this.onSnapshot = config.onSnapshot;
        this.snapshotData = config.snapshotData;
        this.notify = notify;
        // Initialize snapshotData function
        this.takeSnapshotsSuccess = config.takeSnapshotsSuccess;
        this.createSnapshotFailure = config.createSnapshotFailure;
        this.updateSnapshotsSuccess = config.updateSnapshotsSuccess;
        this.updateSnapshotFailure = config.updateSnapshotFailure;
        this.fetchSnapshotSuccess = config.fetchSnapshotSuccess;
        this.createSnapshotSuccess = config.createSnapshotSuccess;
        this.takeSnapshotSuccess = config.takeSnapshotSuccess;
        this.configureSnapshotStore = function (snapshotConfig) {
            snapshotConfig.clearSnapshot(); // Call clearSnapshot method instead of checking its existence
            snapshotConfig.initSnapshot(); // Call initSnapshot method instead of checking its existence
            _this.key = snapshotConfig.key;
            _this.state = config.initialState;
            _this.onSnapshot = snapshotConfig.onSnapshot;
            _this.snapshots = snapshotConfig.snapshots;
            _this.createSnapshot = config.createSnapshot;
            _this.configureSnapshotStore = snapshotConfig.configureSnapshotStore;
            _this.takeSnapshot = snapshotConfig.takeSnapshot;
            _this.getSnapshot = snapshotConfig.getSnapshot;
            _this.getSnapshots = snapshotConfig.getSnapshots;
            _this.getAllSnapshots = snapshotConfig.getAllSnapshots;
            _this.clearSnapshot = snapshotConfig.clearSnapshot;
            _this.configureSnapshotStore = snapshotConfig.configureSnapshotStore;
            _this.takeSnapshotSuccess = snapshotConfig.takeSnapshotSuccess;
            _this.updateSnapshotFailure = snapshotConfig.updateSnapshotFailure;
            _this.takeSnapshotsSuccess = snapshotConfig.takeSnapshotsSuccess;
            _this.fetchSnapshot = snapshotConfig.fetchSnapshot;
            _this.updateSnapshotSuccess = snapshotConfig.updateSnapshotSuccess;
            _this.updateSnapshotsSuccess = snapshotConfig.updateSnapshotsSuccess;
            _this.fetchSnapshotSuccess = snapshotConfig.fetchSnapshotSuccess;
            _this.createSnapshotSuccess = snapshotConfig.createSnapshotSuccess;
            _this.createSnapshotFailure = snapshotConfig.createSnapshotFailure;
            _this.batchUpdateSnapshots = snapshotConfig.batchUpdateSnapshots;
            _this.batchUpdateSnapshotsSuccess =
                snapshotConfig.batchUpdateSnapshotsSuccess;
            _this.batchUpdateSnapshotsRequest =
                snapshotConfig.batchUpdateSnapshotsRequest;
            _this.batchFetchSnapshotsRequest =
                snapshotConfig.batchFetchSnapshotsRequest;
            _this.batchFetchSnapshotsSuccess =
                snapshotConfig.batchFetchSnapshotsSuccess;
            _this.batchFetchSnapshotsFailure =
                snapshotConfig.batchFetchSnapshotsFailure;
            _this.batchUpdateSnapshotsFailure =
                snapshotConfig.batchUpdateSnapshotsFailure;
            _this.notifySubscribers = snapshotConfig.notifySubscribers;
        };
        // Bind 'this' explicitly
        (0, mobx_1.makeAutoObservable)(this);
    }
    SnapshotStore.prototype.setNotificationMessage = function (message, notificationStore) {
        // Check if the notification context is available
        if (notificationStore && notificationStore.notify) {
            // Notify with the provided message
            notificationStore.notify("privateSetNotificationMessageId", message, NotificationMessages_1.default.Notifications.NOTIFICATION_SENT, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
        }
        else {
            // If the notification context is not available, log an error
            console.error("Notification context is not available.");
        }
    };
    SnapshotStore.prototype.setSnapshot = function (newSnapshot) {
        this.state = newSnapshot;
    };
    SnapshotStore.prototype.setSnapshots = function (newSnapshots) {
        this.snapshots = newSnapshots;
    };
    SnapshotStore.prototype.notifySubscribers = function (subscribers) {
        // Utilize the 'subscribers' parameter
        // For example, you can log it to indicate it's being used
        console.log("Subscribers:", subscribers);
        // Construct an array of snapshots with timestamps and data from this.snapshots
        var snapshots = this.snapshots.map(function (snapshotObj) { return snapshotObj.snapshot[0]; });
        return snapshots;
    };
    SnapshotStore.prototype.validateSnapshot = function (data) {
        if (data.timestamp) {
            return true;
        }
        return false;
    };
    SnapshotStore.prototype.getData = function () {
        // Implement logic to retrieve and return the data from the snapshot
        return this.data; // Assuming `data` is the property storing the snapshot data
    };
    // Method to provide indirect access to subscribers
    SnapshotStore.prototype.getSubscribers = function () {
        return this.subscribers;
    };
    SnapshotStore.prototype.getSnapshots = function () {
        return this.snapshots;
    };
    SnapshotStore.prototype.takeSnapshot = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, existingSnapshotIndex, newSnapshot, snapshotObj;
            var _this = this;
            return __generator(this, function (_a) {
                {
                    timestamp = new Date();
                    existingSnapshotIndex = this.snapshots.findIndex(function (snapshotObj) {
                        return snapshotObj.snapshot.some(function (existingSnapshot) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = existingSnapshot.timestamp;
                                    return [4 /*yield*/, data];
                                case 1: return [2 /*return*/, _a === (_b.sent()).timestamp];
                            }
                        }); }); });
                    });
                    if (existingSnapshotIndex !== -1) {
                        // If a snapshot with the same timestamp exists, update it instead of creating a new one
                        this.updateSnapshot(data);
                        return [2 /*return*/, Promise.resolve({ snapshot: [data] })];
                    }
                    newSnapshot = __assign(__assign({}, data), { timestamp: timestamp });
                    snapshotObj = {
                        snapshot: [newSnapshot], // Adjusted structure here, removed unnecessary object nesting
                    };
                    this.snapshots.push(snapshotObj); // Push the snapshot object to the snapshots array
                    this.notify("Snapshot taken at ".concat(new Date(timestamp), "."), NotificationMessages_1.default.Logger.LOG_INFO_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
                    this.notifySubscribers([newSnapshot]); // Pass the new snapshot object
                    if (this.onSnapshot) {
                        this.onSnapshot(data);
                    }
                }
                return [2 /*return*/, {
                        snapshot: []
                    }];
            });
        });
    };
    SnapshotStore.prototype.initSnapshot = function (snapshot) {
        this.takeSnapshot(snapshot);
    };
    SnapshotStore.prototype.createSnapshot = function (data, snapshot) {
        this.snapshots.push(snapshot);
        if (this.onSnapshot) {
            this.onSnapshot(data);
        }
    };
    SnapshotStore.prototype.updateSnapshot = function (newSnapshot) {
        this.state = newSnapshot;
    };
    // Updated to use setSnapshot internally
    SnapshotStore.prototype.fetchSnapshot = function (snapshot) {
        this.setSnapshot(snapshot);
    };
    // Iterate over each snapshot to find a match
    SnapshotStore.prototype.getSnapshot = function (snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var foundSnapshot;
            return __generator(this, function (_a) {
                // Access the snapshot data directly
                this.snapshots.forEach(function (snapshotObj) {
                    snapshotObj.snapshot.forEach(function (snapshotData) {
                        if (snapshotData.timestamp === snapshot.timestamp) {
                            foundSnapshot = snapshotData;
                        }
                    });
                });
                return [2 /*return*/, foundSnapshot ? [foundSnapshot] : []];
            });
        });
    };
    SnapshotStore.prototype.updateSnapshotSuccess = function (snapshot) {
        this.notify("Snapshot updated successfully.", NotificationMessages_1.default.Logger.LOG_INFO_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
        if (Array.isArray(snapshot) && snapshot.length > 0) {
            this.notifySubscribers(snapshot[0].snapshot); // Assuming notifySubscribers expects an array of snapshots
        }
        else {
            console.error("Snapshot array is empty or not properly formatted.");
        }
        if (this.onSnapshot) {
            // Pass the snapshot parameter directly to onSnapshot
            this.onSnapshot(snapshot);
        }
    };
    SnapshotStore.prototype.clearSnapshot = function () {
        return;
    };
    SnapshotStore.prototype.getLatestSnapshot = function () {
        // Return the latest snapshot's data property
        var latestSnapshot = this.snapshots[this.snapshots.length - 1];
        // Check if latestSnapshot is not undefined and contains the data property
        if (latestSnapshot &&
            "timestamp" in latestSnapshot &&
            latestSnapshot &&
            "data" in latestSnapshot) {
            return {
                timestamp: latestSnapshot.timestamp,
                data: latestSnapshot.data, // Cast data to type T
            };
        }
        else {
            // Handle the case where latestSnapshot is undefined or doesn't have the data property
            throw new Error("Latest snapshot is invalid or does not contain data.");
        }
    };
    // Subscribe to snapshot events
    SnapshotStore.prototype.subscribe = function (callback) {
        // Push the callback function directly into the subscribers array
        this.subscribers.push(callback);
    };
    SnapshotStore.prototype.unsubscribe = function (callback) {
        // Find the index of the callback function in the subscribers array
        var index = this.subscribers.indexOf(callback);
        // If found, remove the callback function from the subscribers array
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    };
    SnapshotStore.prototype.batchUpdateSnapshotsRequest = function (snapshotData) {
        this.notify("Snapshot update started.", NotificationMessages_1.default.Logger.LOG_INFO_START, new Date(), NotificationContext_1.NotificationTypeEnum.OperationStart);
        return snapshotData([], []); // Call the snapshotData function with empty arrays
    };
    SnapshotStore.prototype.batchUpdateSnapshots = function (subscribers, snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedSnapshots, _i, subscribers_1, subscriber, innerSnapshot, data;
            return __generator(this, function (_a) {
                updatedSnapshots = [];
                // Iterate over each subscriber in the provided array
                for (_i = 0, subscribers_1 = subscribers; _i < subscribers_1.length; _i++) {
                    subscriber = subscribers_1[_i];
                    innerSnapshot = subscriber.data.data;
                    data = {
                        timestamp: new Date(), // Add timestamp or use existing one
                        data: innerSnapshot, // Assign the inner data
                    };
                    // Process each snapshot data and pass it to the subscribers
                    this.notifySubscribers([data]);
                    // Store the updated snapshot, if necessary
                    // You might need to modify this part based on your requirements
                    updatedSnapshots.push({ snapshot: [snapshot] });
                }
                // Return the array of updated snapshots
                return [2 /*return*/, updatedSnapshots];
            });
        });
    };
    SnapshotStore.prototype.batchUpdateSnapshotsSuccess = function (subscribers, snapshots) {
        this.notify("Snapshot update completed.", NotificationMessages_1.default.Logger.LOG_INFO_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
        if (Array.isArray(subscribers) && subscribers.length > 0) {
            this.notifySubscribers(subscribers); // Updated to use 'subscribers' instead of 'snapshot'
        }
        if (this.onSnapshots) {
            this.onSnapshots(snapshots);
        }
        // Return the updated snapshots
        return [{ snapshots: snapshots }];
    };
    SnapshotStore.prototype.batchFetchSnapshotsRequest = function (snapshotData) {
        this.notify("Snapshot fetch started.", NotificationMessages_1.default.Logger.LOG_INFO_START, new Date(), NotificationContext_1.NotificationTypeEnum.OperationStart);
        return snapshotData;
    };
    SnapshotStore.prototype.batchFetchSnapshotsSuccess = function (subscribers, snapshot) {
        this.notify("Snapshot fetch completed.", NotificationMessages_1.default.Logger.LOG_INFO_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
        if (Array.isArray(subscribers) && subscribers.length > 0) {
            this.notifySubscribers(subscribers);
        }
        if (this.onSnapshot) {
            this.onSnapshot(snapshot);
        }
        return snapshot;
    };
    SnapshotStore.prototype.batchFetchSnapshotsFailure = function (payload) {
        this.notify("Snapshot fetch failed.", NotificationMessages_1.default.Logger.LOG_INFO_FAILURE, new Date(), NotificationContext_1.NotificationTypeEnum.OperationError);
    };
    SnapshotStore.prototype.batchUpdateSnapshotsFailure = function (payload) {
        this.notify("Snapshot update failed.", NotificationMessages_1.default.Logger.LOG_INFO_FAILURE, new Date(), NotificationContext_1.NotificationTypeEnum.OperationError);
    };
    SnapshotStore.prototype.createSnapshotSuccess = function (subscribers) {
        this.notify("Snapshot created successfully.", NotificationMessages_1.default.Logger.LOG_INFO_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.OperationSuccess);
        this.notifySubscribers(subscribers);
    };
    SnapshotStore.prototype.createSnapshotFailure = function (error) {
        this.notify("Snapshot creation failed.", NotificationMessages_1.default.Logger.LOG_INFO_FAILURE, new Date(), NotificationContext_1.NotificationTypeEnum.OperationError);
    };
    SnapshotStore.prototype.updateSnapshotsSuccess = function (snapshotData) {
        // Update the snapshots
    };
    SnapshotStore.prototype.fetchSnapshotSuccess = function (snapshotData) {
        // Update the snapshots
    };
    SnapshotStore.prototype.fetchSnapshotFailure = function (error) {
        this.notify("Failed to fetch snapshot.", NotificationMessages_1.default.Logger.LOG_INFO_FAILURE, new Date(), NotificationContext_1.NotificationTypeEnum.OperationError);
    };
    return SnapshotStore;
}());
// Define the handleSnapshot function
var handleSnapshot = function (snapshot) {
    // Handle the snapshot event
    console.log("Snapshot event handled:", snapshot);
};
var getDefaultState = function () {
    return {
        timestamp: new Date(),
        data: {},
    };
};
// Function to set a dynamic notification message
var setDynamicNotificationMessage = function (message) {
    setNotificationMessage(message);
};
var authState = (0, AuthContext_1.useAuth)().state;
var updateSnapshot = function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
    var updatedSnapshots;
    return __generator(this, function (_a) {
        SnapshotConfig_1.snapshotConfig.setSnapshot(snapshot);
        updatedSnapshots = [snapshot];
        return [2 /*return*/, { snapshot: updatedSnapshots }];
    });
}); };
var convertToSnapshotStore = function (snapshotData) {
    return {
        data: snapshotData,
        store: SnapshotConfig_1.snapshotConfig,
        key: "",
        state: "",
        snapshotData: snapshotData,
        createSnapshot: function () { },
        applySnapshot: function () { },
        // Add remaining missing properties
    };
};
var takeSnapshot = function () { return __awaiter(void 0, void 0, void 0, function () {
    var id, retrievedSnapshot, snapshotStore_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = (_a = authState.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, (0, retrieveSnapshotData_1.retrieveSnapshotData)(String(id))];
            case 1:
                retrievedSnapshot = _b.sent();
                if (retrievedSnapshot) {
                    snapshotStore_1 = convertToSnapshotStore(retrievedSnapshot);
                    return [2 /*return*/, { snapshot: [snapshotStore_1] }]; // Return an array with the retrieved snapshot
                }
                else {
                    return [2 /*return*/, { snapshot: [] }]; // Return an empty array if no snapshot is available
                }
                return [2 /*return*/];
        }
    });
}); };
var getSnapshot = function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
    var snapshotArray;
    return __generator(this, function (_a) {
        snapshotArray = [snapshot];
        return [2 /*return*/, snapshotArray];
    });
}); };
var getSnapshots = function () { return snapshotStoreInstance.getSnapshots(); };
var getAllSnapshots = function () { return snapshotStoreInstance.getAllSnapshots(); };
var clearSnapshot = function () {
    // Implementation logic here
    snapshotStoreInstance.clearSnapshot();
};
// Adjust the method signature to accept a SnapshotStoreConfig parameter
var configureSnapshotStore = function (config, snapshot) {
    // Implementation logic here
    snapshotStoreInstance.configureSnapshotStore(config);
};
var takeSnapshotSuccess = function (snapshot) {
    // Assuming you have access to the snapshot store instance
    // You can perform actions based on the successful snapshot here
    console.log("Snapshot taken successfully:", snapshot);
    // Display a toast message
    var message = {
        id: "snapshot-taken",
        content: "Snapshot taken successfully:",
        timestamp: new Date(),
    };
    (0, ShowToast_1.showToast)(message);
    // Notify with a message
    notify("takeSnapshotSucces", "Snapshot taken successfully", NotificationMessages_1.default.Snapshot.SNAPSHOT_TAKEN, new Date(), NotificationContext_1.NotificationTypeEnum.CreationSuccess);
};
var updateSnapshotFailure = function (payload) {
    // Log the error message or handle it in any way necessary
    console.error("Update snapshot failed:", payload.error);
    // You can also display a notification to the user or perform any other actions
    // For example:
    (0, ShowToast_1.showErrorMessage)(payload.error);
};
var takeSnapshotsSuccess = function (snapshots) {
    // Implementation logic here
};
var fetchSnapshot = function (snapshotId) {
    // Implementation logic here
};
var updateSnapshotSuccess = function (snapshot) {
    // Implementation logic here
};
var updateSnapshotsSuccess = function (snapshots) {
    snapshots.forEach(function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
        var snapshotData, _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, snapshot.data];
                case 1:
                    snapshotData = _g.sent();
                    if (!snapshotData.data.timestamp) return [3 /*break*/, 3];
                    // Assuming snapshotData.data is of type Snapshot<Data, Data>
                    _b = (_a = snapshotStoreInstance).updateSnapshot;
                    return [4 /*yield*/, snapshotData.data];
                case 2:
                    // Assuming snapshotData.data is of type Snapshot<Data, Data>
                    _b.apply(_a, [_g.sent()]);
                    return [3 /*break*/, 5];
                case 3:
                    // Assuming snapshotData.data is of type Data
                    _d = (_c = snapshotStoreInstance).updateSnapshot;
                    return [4 /*yield*/, snapshotData.data];
                case 4:
                    // Assuming snapshotData.data is of type Data
                    _d.apply(_c, [_g.sent()]);
                    _g.label = 5;
                case 5:
                    // Check if snapshotData.data is of type Snapshot<Data, Data>
                    _f = (_e = snapshotStoreInstance).updateSnapshot;
                    return [4 /*yield*/, snapshotData.data];
                case 6:
                    // Check if snapshotData.data is of type Snapshot<Data, Data>
                    _f.apply(_e, [_g.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
};
var fetchSnapshotSuccess = function (snapshot) {
    // Implementation logic here
};
var createSnapshotSuccess = function (snapshot) {
    // Implementation logic here
};
var createSnapshotFailure = function (error) {
    // Implementation logic here
};
var prevTasks = (0, react_1.useRef)({
    // Initial tasks state
    current: {},
});
var setTasks = function (updateFunction) {
    // Update tasks using the provided update function
    var updatedTasks = updateFunction(prevTasks.current);
    // Further logic to handle the updated tasks
};
var batchFetchSnapshotsRequest = function (snapshotData) {
    var snapshots = Object.values(snapshotData);
    snapshots.forEach(function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
        var taskId, tasks;
        return __generator(this, function (_a) {
            taskId = Object.keys(snapshot)[0];
            tasks = Object.values(snapshot)[0];
            setTasks(function (prevTasks) {
                var _a;
                return __assign(__assign({}, prevTasks.current), (_a = {}, _a[taskId] = __spreadArray(__spreadArray([], (prevTasks.current[taskId] || []), true), tasks, true), _a));
            });
            return [2 /*return*/];
        });
    }); });
};
var batchUpdateSnapshotsSuccess = function (snapshotData) {
    // Check if snapshotData array is not empty
    if (snapshotData.length === 0) {
        console.error("Snapshot data array is empty.");
        return;
    }
    // Iterate over each snapshot data in the array
    snapshotData.forEach(function (snapshot) {
        // Extract necessary information from the snapshot data
        var timestamp = snapshot.timestamp, data = snapshot.data;
        // Perform any necessary processing with the snapshot data
        console.log("Processing snapshot taken at ".concat(timestamp, ":"), data);
    });
    // Notify subscribers or perform any other action as needed
    console.log("Batch update snapshots success: Notifying subscribers or performing other actions.");
};
var batchFetchSnapshotsSuccess = function (snapshotData) {
    // Initialize an array to store all fetched snapshots
    var fetchedSnapshots = [];
    // Iterate over each snapshot data in the provided array
    snapshotData.forEach(function (snapshot) {
        // Extract the snapshot's task ID and tasks
        var taskId = Object.keys(snapshot)[0];
        var tasks = Object.values(snapshot)[0];
        // Create a new typed snapshot object with the fetched tasks
        var fetchedSnapshot = createTypedSnapshot(taskId, tasks, notifyFunction);
        // Push the fetched snapshot into the array
        fetchedSnapshots.push(fetchedSnapshot);
    });
    // Further processing logic with the fetched snapshots
};
var batchUpdateSnapshotsFailure = function (payload) {
    // Implementation logic here
};
var notifySubscribers = function (subscribers) {
    // Implementation logic here
};
var notifyFunction = function (message, content, date, type) {
    // Implementation logic for sending notifications
};
var snapshotStoreConfig = (_a = {
        key: "your_key",
        clearSnapshots: undefined,
        initialState: getDefaultState(),
        initSnapshot: function () { },
        updateSnapshot: updateSnapshot,
        takeSnapshot: takeSnapshot,
        getSnapshot: getSnapshot,
        getSnapshots: getSnapshots,
        getAllSnapshots: getAllSnapshots,
        clearSnapshot: clearSnapshot,
        configureSnapshotStore: configureSnapshotStore,
        takeSnapshotSuccess: takeSnapshotSuccess,
        updateSnapshotFailure: updateSnapshotFailure,
        takeSnapshotsSuccess: takeSnapshotsSuccess,
        fetchSnapshot: fetchSnapshot,
        updateSnapshotSuccess: updateSnapshotSuccess,
        updateSnapshotsSuccess: updateSnapshotsSuccess,
        fetchSnapshotSuccess: fetchSnapshotSuccess,
        createSnapshotSuccess: createSnapshotSuccess,
        createSnapshotFailure: createSnapshotFailure,
        batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
        batchFetchSnapshotsRequest: batchFetchSnapshotsRequest,
        batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
        batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
        notifySubscribers: notifySubscribers
    },
    _a[Symbol.iterator] = function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, snapshotStoreInstance.getSnapshots()];
        });
    },
    _a);
var config = __assign(__assign({}, snapshotStoreConfig), { onSnapshot: handleSnapshot });
var snapshotStoreInstance = new SnapshotStore(config, notifyFunction);
exports.snapshotStore = __assign(__assign({}, snapshotStoreInstance), { getSnapshot: function () {
        return __awaiter(this, void 0, void 0, function () {
            var latestSnapshot, snapshotData;
            return __generator(this, function (_a) {
                latestSnapshot = snapshotStoreInstance.getLatestSnapshot();
                snapshotData = latestSnapshot.data;
                return [2 /*return*/, Promise.resolve({
                        timestamp: latestSnapshot.timestamp,
                        data: snapshotData.data,
                    })];
            });
        });
    } });
exports.default = SnapshotStore;
