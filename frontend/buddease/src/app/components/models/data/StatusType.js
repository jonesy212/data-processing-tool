"use strict";
// StatusType.ts
// Define the type for the status property
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoStatus = exports.TeamStatus = exports.TaskStatus = exports.StatusType = exports.PriorityStatus = exports.NotificationStatus = exports.DataStatus = exports.ComponentStatus = exports.ChatType = exports.CalendarStatus = exports.CommunicationMediaType = exports.ProjectPhaseTypeEnum = exports.PriorityTypeEnum = void 0;
var StatusType;
(function (StatusType) {
    StatusType["Pending"] = "pending";
    StatusType["Tentative"] = "tentative";
    StatusType["InProgress"] = "inProgress";
    StatusType["Confirmed"] = "confirmed";
    StatusType["Cancelled"] = "cancelled";
    StatusType["Scheduled"] = "scheduled";
    StatusType["Completed"] = "completed";
})(StatusType || (exports.StatusType = StatusType = {}));
// Define the ChatType enum
var ChatType;
(function (ChatType) {
    ChatType["Public"] = "public";
    ChatType["Private"] = "private";
    ChatType["Group"] = "group";
})(ChatType || (exports.ChatType = ChatType = {}));
// Define specific enums for different types of status
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Pending"] = "pending";
    TaskStatus["InProgress"] = "inProgress";
    TaskStatus["Completed"] = "completed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TodoStatus;
(function (TodoStatus) {
    TodoStatus["Pending"] = "pending";
    TodoStatus["InProgress"] = "inProgress";
    TodoStatus["Completed"] = "completed";
})(TodoStatus || (exports.TodoStatus = TodoStatus = {}));
var TeamStatus;
(function (TeamStatus) {
    TeamStatus["Pending"] = "pending";
    TeamStatus["InProgress"] = "inProgress";
    TeamStatus["Completed"] = "completed";
})(TeamStatus || (exports.TeamStatus = TeamStatus = {}));
var DataStatus;
(function (DataStatus) {
    DataStatus["Pending"] = "pending";
    DataStatus["InProgress"] = "inProgress";
    DataStatus["Completed"] = "completed";
})(DataStatus || (exports.DataStatus = DataStatus = {}));
(function (TeamStatus) {
    TeamStatus["Active"] = "active";
    TeamStatus["Inactive"] = "inactive";
})(TeamStatus || (exports.TeamStatus = TeamStatus = {}));
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["Tentative"] = "tentative";
})(ComponentStatus || (exports.ComponentStatus = ComponentStatus = {}));
// Define the CalendarStatus enum
var CalendarStatus;
(function (CalendarStatus) {
    CalendarStatus["LOADING"] = "loading";
    CalendarStatus["READY"] = "ready";
    CalendarStatus["ERROR"] = "error";
    CalendarStatus["IMPORTING"] = "importing";
    CalendarStatus["IDLE"] = "idle";
    CalendarStatus["Pending"] = "pending";
    CalendarStatus["InProgress"] = "inProgress";
    CalendarStatus["Completed"] = "completed";
    CalendarStatus["Scheduled"] = "scheduled";
    CalendarStatus["Tentative"] = "tentative";
    // Add more status options as needed
})(CalendarStatus || (exports.CalendarStatus = CalendarStatus = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["READ"] = "read";
    NotificationStatus["ERROR"] = "error";
    // Add more status options as needed
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["TENTATIVE"] = "tentative";
    NotificationStatus["IN_PROGRESS"] = "inProgress";
    NotificationStatus["CONFIRMED"] = "confirmed";
    NotificationStatus["CANCELLED"] = "cancelled";
    NotificationStatus["SCHEDULED"] = "scheduled";
    NotificationStatus["COMPLETED"] = "completed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var PriorityStatus;
(function (PriorityStatus) {
    PriorityStatus["Low"] = "low";
    PriorityStatus["Medium"] = "medium";
    PriorityStatus["High"] = "high";
    PriorityStatus["Normal"] = "normal";
})(PriorityStatus || (exports.PriorityStatus = PriorityStatus = {}));
var PriorityTypeEnum;
(function (PriorityTypeEnum) {
    PriorityTypeEnum["Low"] = "low";
    PriorityTypeEnum["Medium"] = "medium";
    PriorityTypeEnum["High"] = "high";
    PriorityTypeEnum["Normal"] = "normal";
})(PriorityTypeEnum || (exports.PriorityTypeEnum = PriorityTypeEnum = {}));
var ProjectPhaseTypeEnum;
(function (ProjectPhaseTypeEnum) {
    ProjectPhaseTypeEnum["Ideation"] = "ideation";
    ProjectPhaseTypeEnum["TeamFormation"] = "team_formation";
    ProjectPhaseTypeEnum["ProductBrainstorming"] = "product_brainstorming";
    ProjectPhaseTypeEnum["Launch"] = "launch";
    ProjectPhaseTypeEnum["DataAnalysis"] = "data_analysis";
})(ProjectPhaseTypeEnum || (exports.ProjectPhaseTypeEnum = ProjectPhaseTypeEnum = {}));
var CommunicationMediaType;
(function (CommunicationMediaType) {
    CommunicationMediaType["Audio"] = "audio";
    CommunicationMediaType["Video"] = "video";
    CommunicationMediaType["Text"] = "text";
})(CommunicationMediaType || (exports.CommunicationMediaType = CommunicationMediaType = {}));
var CollaborationOptionType;
(function (CollaborationOptionType) {
    CollaborationOptionType["ScreenSharing"] = "screen_sharing";
    CollaborationOptionType["DocumentSharing"] = "document_sharing";
    CollaborationOptionType["Whiteboarding"] = "whiteboarding";
    // Add more options as needed
})(CollaborationOptionType || (CollaborationOptionType = {}));
var OutcomeType;
(function (OutcomeType) {
    OutcomeType["ProjectCompletion"] = "project_completion";
    OutcomeType["ProductLaunch"] = "product_launch";
    OutcomeType["DataInsights"] = "data_insights";
    // Add more outcomes as needed
})(OutcomeType || (OutcomeType = {}));
