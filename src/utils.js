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
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForTokenBasedDelay = waitForTokenBasedDelay;
exports.runWithConcurrency = runWithConcurrency;
const tiktoken_1 = require("@dqbd/tiktoken");
function waitForTokenBasedDelay(text_1) {
    return __awaiter(this, arguments, void 0, function* (text, modelName = "gpt-4o", msPerToken = 2) {
        const enc = (0, tiktoken_1.encoding_for_model)(modelName);
        const tokenCount = enc.encode(text).length;
        enc.free();
        const waitMs = tokenCount * msPerToken;
        yield new Promise((resolve) => setTimeout(resolve, waitMs));
    });
}
function runWithConcurrency(tasks_1) {
    return __awaiter(this, arguments, void 0, function* (tasks, maxConcurrency = 3) {
        const results = [];
        const queue = [...tasks];
        function worker() {
            return __awaiter(this, void 0, void 0, function* () {
                while (queue.length > 0) {
                    const task = queue.shift();
                    if (task) {
                        const result = yield task();
                        results.push(result);
                    }
                }
            });
        }
        const workers = Array.from({ length: maxConcurrency }, () => worker());
        yield Promise.all(workers);
        return results;
    });
}
