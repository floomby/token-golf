import { type ITest } from "./odm";
import { env } from "~/env.mjs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const runTest = async (
  test: ITest,
  promptsToTest: string[],
  trim: boolean,
  caseSensitive: boolean
) => {
  let [first, ...rest] = promptsToTest;
  const intermediates: string[] = [];

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

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: first,
      },
    ]
  });

  let resultText = completion.choices[0]?.message.content ?? "";

  while (rest.length > 0) {
    console.log("pushing intermediate", resultText);
    intermediates.push(resultText);

    const [next, ...rest2] = rest;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: next!.replace("{input}", resultText),
        },
      ]
      
    });

    resultText = completion.choices[0]?.message.content ?? "";

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
