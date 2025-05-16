import { encoding_for_model, type TiktokenModel } from "@dqbd/tiktoken";

export async function waitForTokenBasedDelay(
  text: string,
  modelName: TiktokenModel = "gpt-4o",
  msPerToken = 2
) {
  const enc = encoding_for_model(modelName);
  const tokenCount = enc.encode(text).length;
  enc.free();
  const waitMs = tokenCount * msPerToken;
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}

export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrency: number = 3
): Promise<T[]> {
  const results: T[] = [];
  const queue = [...tasks];

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) {
        const result = await task();
        results.push(result);
      }
    }
  }

  const workers = Array.from({ length: maxConcurrency }, () => worker());
  await Promise.all(workers);
  return results;
}
