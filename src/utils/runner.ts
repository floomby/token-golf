import { type ITest } from "./odm";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { env } from "~/env.mjs";

const runTest = async (
  test: ITest,
  promptToTest: string,
  trim: boolean,
  caseSensitive: boolean
) => {
  if (!!env.MOCK_LLMAPI) {
    console.log("MOCKING LLMAPI");
    const success = Math.random() > 0.5;
    const resultText = success ? test.expected : "not " + test.expected;
    return { success, result: resultText };
  }

  const llm = new OpenAI({
    temperature: 0.0,
    openAIApiKey: env.OPENAI_API_KEY,
  });

  const prompt = new PromptTemplate({
    template: promptToTest,
    inputVariables: ["test"],
  });

  const chain = new LLMChain({ llm, prompt });

  const result = (await chain.call({ test: test.test })) as { text: string };

  let resultText = result.text;

  if (trim) {
    resultText = result.text.trim();
  }

  let success = false;

  if (!caseSensitive) {
    success = resultText.toLowerCase() === test.expected.toLowerCase();
  } else {
    success = resultText === test.expected;
  }

  return { success, result: result.text };
};

export { runTest };
