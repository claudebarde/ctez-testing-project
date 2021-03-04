"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var chalk_1 = __importDefault(require("chalk"));
var utils_1 = require("../utils/utils");
var originate = function (file, tezos) { return __awaiter(void 0, void 0, void 0, function () {
    var contractToOriginate, _a, michelson, compileError, op, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(path_1.default.join(__dirname, "../originators", file))); })];
            case 1:
                contractToOriginate = (_b.sent()).default;
                if (!(!contractToOriginate ||
                    !contractToOriginate.hasOwnProperty("name") ||
                    typeof contractToOriginate.name !== "string" ||
                    !contractToOriginate.hasOwnProperty("initialStorage") ||
                    !contractToOriginate.hasOwnProperty("entrypoint") ||
                    typeof contractToOriginate.entrypoint !== "string")) return [3 /*break*/, 2];
                throw "Invalid contract properties";
            case 2: return [4 /*yield*/, utils_1.sh("ligo compile-contract " + path_1.default.join(__dirname, "../contracts", contractToOriginate.name) + " " + contractToOriginate.entrypoint)];
            case 3:
                _a = _b.sent(), michelson = _a.stdout, compileError = _a.stderr;
                if (!compileError) return [3 /*break*/, 4];
                throw compileError;
            case 4:
                // originates contract with Taquito
                process.stdout.write(chalk_1.default.blue("    - Originating " + contractToOriginate.name + "..."));
                op = void 0;
                _b.label = 5;
            case 5:
                _b.trys.push([5, 7, , 8]);
                return [4 /*yield*/, tezos.contract.originate({
                        code: michelson.replace(/\n/g, "").replace(/\s{2,}/g, " "),
                        storage: contractToOriginate.initialStorage
                    })];
            case 6:
                op = _b.sent();
                return [3 /*break*/, 8];
            case 7:
                err_1 = _b.sent();
                process.stdout.clearLine(0);
                console.log(err_1);
                throw err_1;
            case 8:
                // prints confirmation
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(chalk_1.default.blue("    \u2713 Contract successfully originated!\n        - " + contractToOriginate.name + ": " + op.contractAddress + "\n\n"));
                return [4 /*yield*/, op.contract()];
            case 9: return [2 /*return*/, _b.sent()];
        }
    });
}); };
exports.default = (function (tezos) { return __awaiter(void 0, void 0, void 0, function () {
    var files, contractPromises_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                files = fs_1.default.readdirSync(path_1.default.join(__dirname, "../originators"));
                if (!(files && Array.isArray(files) && files.length > 0)) return [3 /*break*/, 2];
                contractPromises_1 = [];
                files.forEach(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (/origin_[a-z0-9-_]+\.[tj]s/.test(file)) {
                            contractPromises_1.push(originate(file, tezos));
                        }
                        else {
                            throw "No contract to compile";
                        }
                        return [2 /*return*/];
                    });
                }); });
                return [4 /*yield*/, Promise.all(contractPromises_1)];
            case 1: 
            // resolves contract promises
            return [2 /*return*/, _a.sent()];
            case 2: return [2 /*return*/, "error"];
            case 3: return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                process.stdout.write("");
                return [2 /*return*/, JSON.stringify(error_1)];
            case 5: return [2 /*return*/];
        }
    });
}); });
