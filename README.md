# Review Generator CLI

> 리뷰 데이터를 기반으로 llm(gpt-4o)을 이용하여 키워드와 제목을 자동 생성해주는 CLI 도구입니다.

## 📦 설치 방법

```bash
npm install git+https://github.com/your-org/review-gen-cli.git
```

## 🚀 사용 방법

```bash
npx review-gen --input ./reviews.csv --output ./output.csv --limit 10
```

### 인자 설명

| 옵션            | 설명                      | 기본값         |
| --------------- | ------------------------- | -------------- |
| `--input`       | 입력 CSV 파일 경로 (필수) |                |
| `--output`      | 출력 CSV 파일 경로        | `./output.csv` |
| `--limit`       | 최대 처리 건수            | `100`          |
| `--concurrency` | 동시에 처리할 작업 개수   | `3`            |

## 📝 입력 CSV 예시

| 리뷰키 | 카테고리 코드 | 제품명                 | 브랜드 | 리뷰                    | ... |
| ------ | ------------- | ---------------------- | ------ | ----------------------- | --- |
| 1VTaNl | AIRPU         | 코웨이 노블 공기청정기 | 코웨이 | 장점: 자동모드가 편해요 | ... |

## ✅ 실행 예시

```bash
npx review-gen --input ./reviews.csv --output ./output.csv --limit 10 --concurrency 3
```

## 💼 개발 가이드

### 로컬 개발 빌드

```bash
npm run build
```

### 로컬 실행 테스트

```bash
npm link
review-gen --input ./sample.csv --output ./result.csv --limit 10
```

## 🔐 환경변수 (.env)

```
OPENAI_API_KEY=your_openai_key_here
```

## 🎯 목표

- 리뷰 데이터를 분석하여
  - **상품 키워드 생성**
  - **리뷰 제목 생성**
- CSV 파일로 결과 저장

## 🙌 기여 방법

1. 이슈 등록
2. PR 생성

## 📝 라이선스

회사 내부 전용
