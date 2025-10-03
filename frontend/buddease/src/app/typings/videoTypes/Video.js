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
Object.defineProperty(exports, "__esModule", { value: true });
var BasicVideoGenerator = /** @class */ (function () {
    function BasicVideoGenerator() {
    }
    BasicVideoGenerator.generateVideo = function (id, title, description) {
        // Assign default values dynamically
        var defaultValues = {
            url: "",
            thumbnailUrl: "",
            duration: 0,
            uploadedBy: "",
            viewsCount: 0,
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
            tags: [],
            uploadDate: new Date(),
            category: "",
            resolution: "",
            aspectRatio: "",
            language: "",
            subtitles: false,
            closedCaptions: false,
            license: "",
            isLive: false,
            channel: "",
            channelId: "",
            isLicensedContent: false,
            isFamilyFriendly: false,
            isEmbeddable: false,
            isDownloadable: false,
            videoData: {},
        };
        // Merge default values with provided properties
        var video = __assign(__assign({}, defaultValues), { id: id, title: title, description: description, videoDislikes: 0, videoAuthor: "", videoDurationInSeconds: 0, playlists: [] });
        return video;
    };
    return BasicVideoGenerator;
}());
exports.default = BasicVideoGenerator;
