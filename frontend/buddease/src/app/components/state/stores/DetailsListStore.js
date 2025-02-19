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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDetailsListStore = void 0;
// DetailsListStore.ts
var mobx_1 = require("mobx");
var SnapshotStore_1 = require("../../snapshots/SnapshotStore");
var NotificationContext_1 = require("../../support/NotificationContext");
var NotificationMessages_1 = require("../../support/NotificationMessages");
var StatusType_1 = require("../../models/data/StatusType");
var notify = (0, NotificationContext_1.useNotification)().notify;
;
var DetailsListStoreClass = /** @class */ (function () {
    function DetailsListStoreClass() {
        var _this = this;
        this.details = {
            pending: [],
            inProgress: [],
            completed: [],
        };
        this.detailsTitle = "";
        this.detailsDescription = "";
        this.detailsStatus = undefined;
        this.subscribe = function (callback) { };
        this.NOTIFICATION_MESSAGE = "";
        this.NOTIFICATION_MESSAGES = NotificationMessages_1.default;
        // Function to set a dynamic notification message
        this.setDynamicNotificationMessage = function (message) {
            _this.setDynamicNotificationMessage(message);
        };
        (0, mobx_1.makeAutoObservable)(this);
        this.initSnapshotStore();
    }
    DetailsListStoreClass.prototype.initSnapshotStore = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, notify("interna snapshot notifications", "Setting up snapshot details", NotificationMessages_1.default.Details.UPDATE_DETAILS_ITEM_SUCCESS, new Date(), NotificationContext_1.NotificationTypeEnum.InvalidCredentials)];
                    case 1:
                        _a.sent();
                        this.snapshotStore = new SnapshotStore_1.default({}, function (message, content, date, type) {
                            notify("", message, content, date, type);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    DetailsListStoreClass.prototype.updateDetailsTitle = function (id, newTitle) {
        var details = this.details;
        // Assuming details[id] is an array of DetailsItem
        details.pending.forEach(function (item) {
            if (item.id === id) {
                item.title = newTitle;
            }
        });
        details.inProgress.forEach(function (item) {
            if (item.id === id) {
                item.title = newTitle;
            }
        });
        details.completed.forEach(function (item) {
            if (item.id === id) {
                item.title = newTitle;
            }
        });
        this.setDetails(details);
    };
    DetailsListStoreClass.prototype.toggleDetails = function (detailsId) {
        var details = this.details;
        var status = this.detailsStatus;
        // Ensure detailsStatus is defined before using it as an index
        if (status === undefined) {
            console.error("Details status is undefined.");
            return;
        }
        var index = details[status].findIndex(function (item) { return item.id === detailsId; });
        if (index !== -1) {
            details[status].splice(index, 1);
        }
        else {
            details[status].push({
                _id: detailsId,
                id: detailsId,
                description: this.detailsDescription,
                title: this.detailsTitle,
                status: this.detailsStatus,
                phase: {},
                data: {},
                isActive: false,
                type: "details",
                analysisResults: {},
            });
        }
        this.setDetails(details);
    };
    DetailsListStoreClass.prototype.updateDetailsDescription = function (id, description) {
        var details = this.details;
        // Assuming details[id] is an array of DetailsItem
        details.pending.forEach(function (item) {
            if (item.id === id) {
                item.description = description;
            }
        });
        details.inProgress.forEach(function (item) {
            if (item.id === id) {
                item.description = description;
            }
        });
        details.completed.forEach(function (item) {
            if (item.id === id) {
                item.description = description;
            }
        });
        this.setDetails(details);
    };
    DetailsListStoreClass.prototype.updateDetailsStatus = function (status) {
        // Map StatusType values to TaskStatus values
        switch (status) {
            case StatusType_1.StatusType.Pending:
                this.detailsStatus = StatusType_1.TaskStatus.Pending;
                break;
            case StatusType_1.StatusType.InProgress:
                this.detailsStatus = StatusType_1.TaskStatus.InProgress;
                break;
            case StatusType_1.StatusType.Completed:
                this.detailsStatus = StatusType_1.TaskStatus.Completed;
                break;
            case StatusType_1.StatusType.Tentative:
                // Handle Tentative status if needed
                break;
            case StatusType_1.StatusType.Confirmed:
                // Handle Confirmed status if needed
                break;
            case StatusType_1.StatusType.Cancelled:
                // Handle Cancelled status if needed
                break;
            case StatusType_1.StatusType.Scheduled:
                // Handle Scheduled status if needed
                break;
            default:
                this.detailsStatus = undefined;
                break;
        }
    };
    DetailsListStoreClass.prototype.addDetailsItem = function (detailsItem) {
        var _a;
        var status = detailsItem.status || StatusType_1.TaskStatus.Pending;
        this.details = __assign(__assign({}, this.details), (_a = {}, _a[status] = __spreadArray(__spreadArray([], (this.details[status] || []), true), [detailsItem], false), _a));
        // Optionally, you can trigger notifications or perform other actions on success
        this.setDynamicNotificationMessage(NotificationMessages_1.default.OperationSuccess.DEFAULT);
    };
    DetailsListStoreClass.prototype.addDetails = function () {
        // Ensure the title is not empty before adding an item
        if (this.detailsTitle.trim().length === 0) {
            console.error("Item title cannot be empty.");
            return;
        }
        var newDetailsItem = {
            id: Date.now().toString(),
            title: this.detailsTitle,
            status: StatusType_1.TaskStatus.Pending,
            description: this.detailsDescription,
            // data: {} as Data,
            phase: {},
            isActive: false,
            type: "details",
            _id: "",
            analysisResults: []
        };
        this.addDetailsItem(newDetailsItem);
        // Reset input fields after adding an item
        this.detailsTitle = "";
        this.detailsDescription = "";
        this.detailsStatus = StatusType_1.TaskStatus.Pending;
    };
    DetailsListStoreClass.prototype.setDetails = function (details) {
        this.details = details;
    };
    DetailsListStoreClass.prototype.removeDetails = function (detailsId) {
        var updatedDetails = __assign({}, this.details);
        delete updatedDetails[detailsId];
        this.details = updatedDetails;
    };
    DetailsListStoreClass.prototype.removeDetailsItems = function (detailsIds) {
        var updatedDetails = __assign({}, this.details);
        detailsIds.forEach(function (detailsId) {
            delete updatedDetails[detailsId];
        });
        this.details = updatedDetails;
    };
    DetailsListStoreClass.prototype.addDetail = function (detail) {
        var _a;
        // Assuming 'detail' is a valid Data object to be added
        var status = detail.status || StatusType_1.TaskStatus.Pending;
        // Ensure detail.id is not null or undefined before assigning
        var id = (_a = String(detail.id)) !== null && _a !== void 0 ? _a : "";
        // Ensure detail.description is always a string or undefined
        var description = detail.description || ""; // Provide a default empty string if description is null or undefined
        var phase = detail.phase || {}; // Provide a default empty object if phase is null or undefined
        // Create a copy of the current state of details
        var updatedDetails = __assign({}, this.details);
        // Get the array associated with the current status or create a new empty array
        var statusArray = updatedDetails[status] || [];
        if (detail.title !== undefined) {
            // Add the new detail to the status array
            statusArray.push({
                _id: detail.title,
                id: id,
                title: detail.title,
                status: detail.status,
                description: description,
                phase: phase,
                type: "detail",
                isActive: false,
                analysisResults: {}
            });
        }
        // Update the details object with the new status array
        updatedDetails[status] = statusArray;
        // Set the updated details object to the class property
        this.details = updatedDetails;
    };
    return DetailsListStoreClass;
}());
var useDetailsListStore = function () {
    return new DetailsListStoreClass();
};
exports.useDetailsListStore = useDetailsListStore;
