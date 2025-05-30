#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const core_1 = require("../src/core");
const path_1 = __importDefault(require("path"));
const program = new commander_1.Command();
program
    .name("review-gen")
    .description("리뷰 데이터 기반 키워드/제목 생성 CLI")
    .requiredOption("-i, --input <path>", "입력 CSV 파일 경로")
    .option("-o, --output <path>", "출력 CSV 파일 경로", "./output.csv")
    .option("-l, --limit <number>", "최대 처리 건수", "100")
    .option("--concurrency <number>", "동시 작업 개수", "3")
    .option("--openai-key <key>", "OpenAI API Key (옵션)")
    .option("--prompt <prompt>", "프롬프트 문자열 (옵션)")
    .parse(process.argv);
const options = program.opts();
const openaiKey = options.openaiKey || process.env.OPENAI_API_KEY;
if (!options.prompt) {
    console.error("❌ 프롬프트 문자열이 없습니다. --prompt 옵션을 확인해주세요.");
    process.exit(1);
}
if (!openaiKey) {
    console.error("❌ OpenAI API Key가 없습니다. --openai-key 옵션이나 .env 파일을 확인하세요.");
    process.exit(1);
}
console.log(`📄 입력 파일: ${options.input}`);
console.log(`💾 출력 파일: ${options.output}`);
console.log(`🔢 처리 건수: 최대 ${options.limit}건`);
console.log(`🚀 동시 처리: ${options.concurrency}개`);
(0, core_1.processCsv)(path_1.default.resolve(options.input), path_1.default.resolve(options.output), parseInt(options.limit), parseInt(options.concurrency), openaiKey, options.prompt);
