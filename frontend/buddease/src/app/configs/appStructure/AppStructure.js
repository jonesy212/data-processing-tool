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
Object.defineProperty(exports, "__esModule", { value: true });
// AppStructure.ts
var chokidar_1 = require("chokidar");
var fs = require("fs");
var path = require("path");
var appPath_1 = require("../../../../appPath");
var VersionGenerator_1 = require("@/app/generators/VersionGenerator");
var _a = (0, VersionGenerator_1.getCurrentAppInfo)(), versionNumber = _a.versionNumber, appVersion = _a.appVersion;
var AppStructure = /** @class */ (function () {
    function AppStructure(type) {
        var _this = this;
        this.structure = {};
        var projectPath = type === "backend"
            ? (0, appPath_1.default)(versionNumber, appVersion)
            : path.join((0, appPath_1.default)(versionNumber, appVersion), "datanalysis/frontend");
        this.traverseDirectory(projectPath, type);
        // Use chokidar to watch for file changes
        var watcher = chokidar_1.default.watch(projectPath, {
            ignoreInitial: true, // Ignore the initial file system scan
        });
        // Event listener for file changes
        watcher.on("all", function (event, filePath) {
            _this.handleFileChange(event, filePath);
        });
    }
    AppStructure.prototype.traverseDirectory = function (dir, type) {
        var files = fs.readdirSync(dir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath = path.join(dir, file);
            var isDirectory = fs.statSync(filePath).isDirectory();
            if (isDirectory) {
                this.traverseDirectory(filePath, type);
            }
            else {
                // Logic to parse file and update structure accordingly
                if ((type === "backend" && file.endsWith(".py")) ||
                    (type === "frontend" && file.endsWith(".tsx"))) {
                    this.structure[file] = {
                        path: filePath,
                        content: fs.readFileSync(filePath, "utf-8"),
                    };
                }
            }
        }
    };
    AppStructure.prototype.getStructure = function () {
        return __assign({}, this.structure);
    };
    AppStructure.prototype.handleFileChange = function (event, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedContent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Logic to handle file changes and update the structure accordingly
                        console.log("File changed: ".concat(event, " ").concat(filePath));
                        return [4 /*yield*/, fs.promises.readFile(filePath, "utf-8")];
                    case 1:
                        updatedContent = _a.sent();
                        // Update the structure
                        this.structure[path.basename(filePath)] = {
                            path: filePath,
                            content: updatedContent,
                        };
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error handling file change: ".concat(error_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AppStructure;
}());
exports.default = AppStructure;
