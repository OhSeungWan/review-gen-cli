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
const prompts_1 = require("@langchain/core/prompts");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
dotenv_1.default.config();
function processCsv(inputPath, outputPath, limit, openaiKey
// concurrency: number,
// promptOverride: string
) {
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
            const prodName = row["제품명"];
            const brand = row["브랜드"];
            const review = row["리뷰"];
            // const promptContext = `제품명: ${row["제품명"]}\n브랜드: ${row["브랜드"]}\n리뷰: ${row["리뷰"]}`;
            console.log(`💬  ${index + 1}/${limit} "${row["제품명"]}" 처리 중...`);
            const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      [IDENTITY]
당신은 주어진 리뷰 내용을 보고 '리뷰어가 칭찬한 첫 번째 기능'을 살려 담백하고 캐주얼한 어투의 한 줄 제목을 생성하고,
주어진 제품명·카테고리명·브랜드명을 조합하여 제품명을 생성해서, 생성한 제목과 생성한 제품명을 결과로 알려주는 AI입니다.

[INSTRUCTIONS]
검토하고서 제목과 키워드를 생성해야 하는 데이터에는 여러 개의 리뷰가 포함되어 있을 수 있습니다.

[제목 생성 규칙]

리뷰 내용의 글자수가 600자 미만이며, 글자수의 1의 자리가 3이나 7일 때는 반드시 단점 관련 제목으로 생성합니다.

조건에 해당되지 않을 경우에는 장점 관련 제목을 생성합니다.

단점 제목 작성 조건에 부합한다면 반드시 부정적인 제목으로 생성하고, 그 외에는 장점을 살린 제목으로 생성합니다.

실제 사람이 쓴 듯 자연스러운 구어체로 작성하고, 캐주얼한 느낌을 살립니다.

맞춤법과 띄어쓰기를 정확히 지켜주세요.

제품명·브랜드·카테고리 언급은 제목에서는 생략 가능하지만, 필요 시 자연스럽게 포함합니다.

리뷰에서 장점을 찾지 못 하겠다면, 감정이 들어난 부분을 활용합니다.

리뷰 내용의 말투와 어조를 최대한 반영해서 제목을 만듭니다.

"ㅎㅎ"나 "ㅋㅋ"를 사용했으면 제목에도 반영합니다.

"~~"를 많이 사용한 경우 제목에도 반영합니다.

제목을 편안한 느낌으로, 느낌표는 정말 필요할 때만 사용합니다.

제목은 25~30자 내외로, 한 문장으로 요약하여 구성합니다.

리뷰 본문의 어투를 참고하여 비슷한 어투로 제목을 생성합니다.

너무 과장된 표현을 피하고, 담백하게 실질적인 장점을 중심으로 작성합니다.

이모지나 특수문자는 리뷰 작성자가 사용한 경우 활용합니다.

[제품명 생성 규칙]
1. SEO에 최적화된 키워드 형식을 3단어로 조합하여 생성합니다
   - 맞춤법과 띄어쓰기를 준수합니다.  

2. 글자 수에 따른 구분 방식을 수정합니다.
   - 홀수일 경우: "브랜드명 + 카테고리명" 또는 "제품명(간단 버전)" 중 랜덤하게 선택  
   - 짝수일 경우: "제품명(간단 버전)" 또는 "브랜드명 + 대표 기능" 중 랜덤하게 선택  

3. 간단 버전 제품명 생성 로직
   - 3단어 이상일 경우, 주요 키워드만 추출합니다.  
   - 예: "인스퓨어 트리플케어8 비데" → "트리플케어8"  
         "트롬 듀얼 인버터 히트펌프 건조기 10Kg" → "트롬 건조기"  
         "쿠쿠 인앤아웃 아이스 10'S 정수기" → "쿠쿠 인앤아웃 정수기"  

4. 같은 키워드가 반복되면 최적화된 단어로 대체합니다.
   - 예: "냉온정 정수기" → "정수기"  
      
   
리뷰내용: {content}\n
제품명: {prodName}\n
브랜드명: {brandKorean}\n
   `);
            const modelWithStructuredOutput = model.withStructuredOutput(zod_1.default.object({ keyword: zod_1.default.string(), title: zod_1.default.string() }));
            const agentResult = yield prompt.pipe(modelWithStructuredOutput).invoke({
                content: review,
                prodName: prodName,
                brandKorean: brand,
            });
            // .invoke([
            //   new SystemMessage({ content: promptOverride }),
            //   new HumanMessage({ content: promptContext }),
            // ]);
            return Object.assign(Object.assign({}, row), { "생성된 상품 키워드": agentResult.keyword, "생성된 리뷰 제목": agentResult.title });
        }));
        const results = yield (0, utils_1.runWithConcurrency)(tasks, 3);
        const outputCsv = (0, sync_2.stringify)(results, { header: true });
        fs_1.default.writeFileSync(outputPath, outputCsv, "utf-8");
        console.log(`\n✅  완료! ${outputPath} 에 저장되었습니다.`);
    });
}
