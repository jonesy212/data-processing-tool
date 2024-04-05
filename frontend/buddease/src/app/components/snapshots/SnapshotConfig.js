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
exports.snapshotConfig = void 0;
var GenerateUniqueIds_1 = require("@/app/generators/GenerateUniqueIds");
var generateSnapshotId = GenerateUniqueIds_1.default.generateSnapshotId();
// Define the snapshot configuration object
var snapshotConfig = {
    clearSnapshots: undefined, // Define the behavior for clearing snapshots if needed
    key: "teamSnapshotKey", // Provide a key for the snapshot store
    initialState: {},
    snapshots: [], // Initialize snapshots as an empty array
    initSnapshot: function () { }, // Define the behavior for initializing a snapshot if needed
    updateSnapshot: function () { }, // Define the behavior for updating a snapshot if needed
    takeSnapshot: function () { }, // Define the behavior for taking a snapshot if needed
    getSnapshot: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, []];
    }); }); }, // Define the behavior for getting a snapshot if needed
    getSnapshots: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    snapshot: snapshotConfig.snapshots
                })];
        });
    }); }, // Return object with snapshot property to match expected return type
    getAllSnapshots: function () { return []; }, // Define the behavior for getting all snapshots if needed
    clearSnapshot: function () { }, // Define the behavior for clearing a snapshot if needed
    configureSnapshotStore: function () { }, // Define the behavior for configuring the snapshot store if needed
    takeSnapshotSuccess: function () { }, // Define the behavior for a successful snapshot if needed
    updateSnapshotFailure: function () { }, // Define the behavior for a failed snapshot update if needed
    takeSnapshotsSuccess: function () { }, // Define the behavior for successful snapshot taking if needed
    fetchSnapshot: function () { }, // Define the behavior for fetching a snapshot if needed
    updateSnapshotSuccess: function () { }, // Define the behavior for successful snapshot update if needed
    updateSnapshotsSuccess: function () { }, // Define the behavior for successful snapshot updates if needed
    fetchSnapshotSuccess: function () { }, // Define the behavior for successful snapshot fetch if needed
    createSnapshotSuccess: function () { }, // Define the behavior for successful snapshot creation if needed
    createSnapshotFailure: function () { }, // Define the behavior for failed snapshot creation if needed
    batchTakeSnapshots: function () { }, // Define the behavior for batch snapshot taking if needed
    batchUpdateSnapshots: function () { }, // Define the behavior for batch snapshot updates if needed
    batchUpdateSnapshotsSuccess: function () { }, // Define the behavior for successful batch snapshot updates if needed
    batchFetchSnapshotsRequest: function () { }, // Define the behavior for batch snapshot fetch request if needed
    batchFetchSnapshotsSuccess: function () { }, // Define the behavior for successful batch snapshot fetch if needed
    batchFetchSnapshotsFailure: function () { }, // Define the behavior for failed batch snapshot fetch if needed
    batchUpdateSnapshotsFailure: function () { }, // Define the behavior for failed batch snapshot updates if needed
    // Define the behavior for notifying subscribers if needed
    notifySubscribers: function (subscribers) {
        // Perform actions to notify subscribers here
        subscribers.forEach(function (subscriber) {
            subscriber.onSnapshot(subscriber.snapshot);
        });
        // Return an object with the correct structure
        return {
            snapshot: [{ snapshot: [] }], // Provide an empty array or the appropriate data
        };
    },
};
exports.snapshotConfig = snapshotConfig;
