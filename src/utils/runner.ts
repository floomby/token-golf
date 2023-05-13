import { ITest } from "./odm";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { env } from "~/env.mjs";

const runTest = async (test: ITest, promptToTest: string) => {
  const llm = new OpenAI({
    temperature: 0.0,
    openAIApiKey: env.OPENAI_API_KEY,
  });

  const prompt = new PromptTemplate({
    template: promptToTest,
    inputVariables: ["test"],
  });

  const chain = new LLMChain({ llm, prompt });

  const result = await chain.call({ test: test.test });

  console.log("result", result);

  return { success: result.text === test.expected, result: result.text };
};

export { runTest };
