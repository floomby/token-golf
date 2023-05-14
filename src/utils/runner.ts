import { ITest } from "./odm";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { env } from "~/env.mjs";

const runTest = async (test: ITest, promptToTest: string, trim: boolean, caseSensitive: boolean) => {
  const resultText = Math.random() > 0.5 ? "positive" : "negative";

  // const llm = new OpenAI({
  //   temperature: 0.0,
  //   openAIApiKey: env.OPENAI_API_KEY,
  // });

  // const prompt = new PromptTemplate({
  //   template: promptToTest,
  //   inputVariables: ["test"],
  // });

  // const chain = new LLMChain({ llm, prompt });

  // const result = await chain.call({ test: test.test });

  // console.log("result", result);

  // let resultText = result.text;

  // if (trim) {
  //   resultText = result.text.trim();
  // }

  let success = false;

  if (!caseSensitive) {
    success = resultText.toLowerCase() === test.expected.toLowerCase();
  } else {
    success = resultText === test.expected;
  }

  // return { success, result: result.text as string };
  return { success, result: resultText };
};

export { runTest };
