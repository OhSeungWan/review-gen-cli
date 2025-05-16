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
    .description("리뷰 데이터 기반 키워드와 제목을 생성하는 CLI")
    .requiredOption("-i, --input <path>", "입력 CSV 파일 경로")
    .option("-o, --output <path>", "출력 CSV 파일 경로", "./output.csv")
    .option("-l, --limit <number>", "최대 처리 건수", "100")
    .parse(process.argv);
const options = program.opts();
console.log(`📄  입력 파일: ${options.input}`);
console.log(`💾  출력 파일: ${options.output}`);
console.log(`🔢  처리 건수: 최대 ${options.limit}건\n`);
(0, core_1.processCsv)(path_1.default.resolve(options.input), path_1.default.resolve(options.output), parseInt(options.limit));
