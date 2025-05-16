#!/usr/bin/env node
import { Command } from "commander";
import { processCsv } from "../src/core";
import path from "path";

const program = new Command();

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

processCsv(
  path.resolve(options.input),
  path.resolve(options.output),
  parseInt(options.limit)
);
