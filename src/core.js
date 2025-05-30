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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCsv = processCsv;
const fs_1 = __importDefault(require("fs"));
const sync_1 = require("csv-parse/sync");
const sync_2 = require("csv-stringify/sync");
const openai_1 = require("@langchain/openai");
const zod_1 = __importDefault(require("zod"));
const messages_1 = require("@langchain/core/messages");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
dotenv_1.default.config();
function processCsv(inputPath, outputPath, limit, concurrency, openaiKey, promptOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = new openai_1.ChatOpenAI({
            model: "gpt-4o",
            temperature: 0,
            apiKey: openaiKey,
        });
        const csvContent = fs_1.default.readFileSync(inputPath, "utf-8");
        const allRecords = (0, sync_1.parse)(csvContent, { columns: true });
        const records = allRecords.slice(0, limit);
        const tasks = records.map((row, index) => () => __awaiter(this, void 0, void 0, function* () {
            const promptContext = `제품명: ${row["제품명"]}\n브랜드: ${row["브랜드"]}\n리뷰: ${row["리뷰"]}`;
            console.log(`💬  ${index + 1}/${limit} "${row["제품명"]}" 처리 중...`);
            const agentResult = yield model
                .withStructuredOutput(zod_1.default.object({ keyword: zod_1.default.string(), title: zod_1.default.string() }))
                .invoke([
                new messages_1.SystemMessage({ content: promptOverride }),
                new messages_1.HumanMessage({ content: promptContext }),
            ]);
            return Object.assign(Object.assign({}, row), { "생성된 상품 키워드": agentResult.keyword, "생성된 리뷰 제목": agentResult.title });
        }));
        const results = yield (0, utils_1.runWithConcurrency)(tasks, 3);
        const outputCsv = (0, sync_2.stringify)(results, { header: true });
        fs_1.default.writeFileSync(outputPath, outputCsv, "utf-8");
        console.log(`\n✅  완료! ${outputPath} 에 저장되었습니다.`);
    });
}
