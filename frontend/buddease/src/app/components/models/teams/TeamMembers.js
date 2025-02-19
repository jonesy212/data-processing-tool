"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamMember = exports.memberData = void 0;
var memberData = {
    id: 1,
    username: 'member1',
    email: 'member1@example.com',
    teamId: "",
    roleInTeam: "",
    _id: "",
    tier: "",
    uploadQuota: 0,
    fullName: null,
    bio: null,
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    role: {},
    timeBasedCode: "",
    memberName: ""
};
exports.memberData = memberData;
var teamMember = {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
    tier: "free",
    upload_quota: 0,
    user_type: "individual",
    // Add other TeamMember-related field values
};
exports.teamMember = teamMember;
