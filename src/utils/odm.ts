import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export interface IRun {
  prompt: string;
  challenge: ObjectId;
  results: string[];
  profile: ObjectId;
}

const RunSchema = new mongoose.Schema<IRun>({
  prompt: { type: String, required: true },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  results: [{ type: String, required: true }],
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const Run =
  (mongoose.models.Run as mongoose.Model<IRun>) ||
  mongoose.model<IRun>("Run", RunSchema);

export interface IScore {
  tokenCount: number;
  profile: ObjectId;
  run: ObjectId;
}

export interface ITest {
  input: string;
  output: string;
}

export interface IChallenge {
  name: string;
  description: string;
  tests: ITest[];
  scores: IScore[];
}

const ChallengeSchema = new mongoose.Schema<IChallenge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tests: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  scores: [
    {
      tokenCount: { type: Number, required: true },
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
      },
      run: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Run",
        required: true,
      },
    },
  ],
});

const Challenge =
  (mongoose.models.Challenge as mongoose.Model<IChallenge>) ||
  mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export interface IProfile {
  email: string;
  displayName: string;
  image: string;
}

const ProfileSchema = new mongoose.Schema<IProfile>({
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  image: { type: String, required: true },
});

const Profile =
  (mongoose.models.Profile as mongoose.Model<IProfile>) ||
  mongoose.model<IProfile>("Profile", ProfileSchema);

export { Profile, Challenge, Run };
