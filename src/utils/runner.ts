import { type ITest } from "./odm";
import { env } from "~/env.mjs";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const runTest = async (
  test: ITest,
  promptsToTest: string[],
  trim: boolean,
  caseSensitive: boolean
) => {
  let [first, ...rest] = promptsToTest;
  const intermediates: string[] = [];

  console.log("running test", test.test, promptsToTest);

  if (!!env.MOCK_LLMAPI) {
    console.log("MOCKING LLMAPI");
    const success = Math.random() > 0.5;
    const resultText = success ? test.expected : "not " + test.expected;
    for (let i = 1; i < promptsToTest.length; i++) {
      intermediates.push("mocked intermediate " + i.toString());
    }
    return { success, result: resultText, intermediates };
  }

  const maxTokens = parseInt(env.MAX_TOKENS_PER_STAGE);

  first = first!.replace("{input}", test.test);

  const output = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: first,
    temperature: 0,
    max_tokens: maxTokens,
  })

  let resultText = output.data.choices[0]?.text ?? "";

  while (rest.length > 0) {
    console.log("pushing intermediate", resultText);
    intermediates.push(resultText);

    let [next, ...rest2] = rest;

    next = next!.replace("{input}", resultText);

    const output = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: next,
      temperature: 0,
      max_tokens: maxTokens,
    });

    resultText = output.data.choices[0]?.text ?? "";

    rest = rest2;
  }

  if (trim) {
    resultText = resultText.trim();
  }

  let success = false;

  if (!caseSensitive) {
    success = resultText.toLowerCase() === test.expected.toLowerCase();
  } else {
    success = resultText === test.expected;
  }

  return { success, result: resultText, intermediates };
};

export { runTest };
