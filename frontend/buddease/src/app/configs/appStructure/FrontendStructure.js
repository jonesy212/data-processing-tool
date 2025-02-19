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
exports.frontendStructure = void 0;
// FrontendStructure.ts
var fs = require("fs");
var path = require("path");
var FrontendStructure = /** @class */ (function () {
    function FrontendStructure(projectPath) {
        this.structure = {};
        this.traverseDirectory(projectPath);
    }
    FrontendStructure.prototype.traverseDirectory = function (dir) {
        var files = fs.readdirSync(dir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath = path.join(dir, file);
            var isDirectory = fs.statSync(filePath).isDirectory();
            if (isDirectory) {
                this.traverseDirectory(filePath);
            }
            else {
                if (file.endsWith('.tsx')) {
                    this.structure[file] = {
                        path: filePath,
                        content: fs.readFileSync(filePath, 'utf-8'),
                    };
                }
            }
        }
    };
    FrontendStructure.prototype.getStructure = function () {
        return __assign({}, this.structure);
    };
    return FrontendStructure;
}());
exports.default = FrontendStructure;
exports.frontendStructure = new FrontendStructure(projectPath);
