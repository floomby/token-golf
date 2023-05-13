import { z } from "zod";

const ChallengeUploadSchema = z.object({
  name: z.string(),
  description: z.string(),
  tests: z.array(
    z.object({
      test: z.string(),
      expected: z.string(),
    })
  ).min(1),
});

export type ChallengeUpload = z.infer<typeof ChallengeUploadSchema>;
export { ChallengeUploadSchema };