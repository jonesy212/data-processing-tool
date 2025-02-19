"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// appPath.ts
var path_1 = require("path");
var getAppPath = function (versionNumber, appVersion) {
    var currentFilePath = __filename;
    var appPath = path_1.default.resolve(currentFilePath, '../..'); // Go up three levels to reach the app root
    // Handle variations in app folder names (convert to lowercase)
    var normalizedAppPath = appPath.toLowerCase().replace(/[_ ]/g, '');
    // Include version information in the app path
    var versionedAppPath = path_1.default.join(normalizedAppPath, "".concat(versionNumber, "_").concat(appVersion));
    return versionedAppPath;
};
exports.default = getAppPath;
