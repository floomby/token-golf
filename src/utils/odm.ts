import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export interface IResult {
  result: string;
  success: boolean;
}

export interface IRun {
  prompt: string;
  trim: boolean;
  caseSensitive: boolean;
  tokenCount: number;
  challenge: ObjectId;
  at: Date;
  results: IResult[];
  success: boolean;
  profile: ObjectId;
}

const RunSchema = new mongoose.Schema<IRun>({
  prompt: { type: String, required: true },
  trim: { type: Boolean, required: true },
  caseSensitive: { type: Boolean, required: true },
  tokenCount: { type: Number, required: true },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  at: { type: Date, required: true, default: Date.now },
  results: { type: [{ result: String, success: Boolean }], required: true },
  success: { type: Boolean, required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const Run =
  (mongoose.models.Run as mongoose.Model<IRun>) ||
  mongoose.model<IRun>("Run", RunSchema);

export interface ITestRun {
  prompt: string;
  trim: boolean;
  caseSensitive: boolean;
  tokenCount: number;
  challenge: ObjectId;
  at: Date;
  testIndex: number;
  result: string;
  success: boolean;
  profile: ObjectId;
}

const TestRunSchema = new mongoose.Schema<ITestRun>({
  prompt: { type: String, required: true },
  trim: { type: Boolean, required: true },
  caseSensitive: { type: Boolean, required: true },
  tokenCount: { type: Number, required: true },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  at: { type: Date, required: true, default: Date.now },
  testIndex: { type: Number, required: true },
  result: { type: String, required: true },
  success: { type: Boolean, required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const TestRun =
  (mongoose.models.TestRun as mongoose.Model<ITestRun>) ||
  mongoose.model<ITestRun>("TestRun", TestRunSchema);

export interface IScore {
  tokenCount: number;
  profile: ObjectId;
  run: ObjectId;
}

export interface ITest {
  test: string;
  expected: string;
}

export interface IChallenge {
  name: string;
  description: string;
  tests: ITest[];
  scores: IScore[];
  createdAt: Date;
  createdBy: ObjectId;
}

const ChallengeSchema = new mongoose.Schema<IChallenge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tests: {
    type: [
      {
        test: { type: String, required: true },
        expected: { type: String, required: true },
      },
    ],
    required: true,
  },
  scores: {
    type: [
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
    default: [],
  },
  createdAt: { type: Date, required: true, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const Challenge =
  (mongoose.models.Challenge as mongoose.Model<IChallenge>) ||
  mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export interface IProfile {
  email: string;
  name: string;
  image: string;
}

const ProfileSchema = new mongoose.Schema<IProfile>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
});

const Profile =
  (mongoose.models.Profile as mongoose.Model<IProfile>) ||
  mongoose.model<IProfile>("Profile", ProfileSchema);

export { Profile, Challenge, Run, TestRun };
