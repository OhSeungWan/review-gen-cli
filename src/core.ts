import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { ChatOpenAI } from "@langchain/openai";
import z from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

export async function processCsv(
  inputPath: string,
  outputPath: string,
  limit: number
) {
  const csvContent = fs.readFileSync(inputPath, "utf-8");
  const allRecords = parse(csvContent, { columns: true });
  const records = allRecords.slice(0, limit);

  const results = [];
  for (const [index, row] of records.entries()) {
    const promptContext = `제품명: ${row["제품명"]}\n브랜드: ${row["브랜드"]}\n리뷰: ${row["리뷰"]}`;

    console.log(`💬  ${index + 1}/${limit} "${row["제품명"]}" 처리 중...`);

    const agentResult = await model
      .withStructuredOutput(
        z.object({ keyword: z.string(), title: z.string() })
      )
      .invoke([
        new SystemMessage({ content: "프롬프트 생략(기존 것 사용)" }),
        new HumanMessage({ content: promptContext }),
      ]);

    results.push({
      ...row,
      "생성된 상품 키워드": agentResult.keyword,
      "생성된 리뷰 제목": agentResult.title,
    });
  }

  const outputCsv = stringify(results, { header: true });
  fs.writeFileSync(outputPath, outputCsv, "utf-8");
  console.log(`\n✅  완료! ${outputPath} 에 저장되었습니다.`);
}
