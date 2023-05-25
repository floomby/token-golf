import mongoose from "mongoose";
import { type ObjectId } from "mongodb";

export interface IResult {
  result: string;
  intermediates: string[];
  success: boolean;
}

export interface IRun {
  prompts: string[];
  trim: boolean;
  caseSensitive: boolean;
  tokenCount: number;
  challenge: ObjectId;
  at: Date;
  results: IResult[];
  success: boolean;
  profile?: ObjectId;
}

const RunSchema = new mongoose.Schema<IRun>({
  prompts: { type: [String], required: true },
  trim: { type: Boolean, required: true },
  caseSensitive: { type: Boolean, required: true },
  tokenCount: { type: Number, required: true },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  at: { type: Date, required: true, default: Date.now },
  results: {
    type: [
      {
        result: String,
        intermediates: {
          type: [String],
          default: [],
        },
        success: Boolean,
      },
    ],
    required: true,
  },
  success: { type: Boolean, required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: false,
  },
});

const Run =
  (mongoose.models.Run as mongoose.Model<IRun>) ||
  mongoose.model<IRun>("Run", RunSchema);

export interface ITestRun {
  prompts: string[];
  trim: boolean;
  caseSensitive: boolean;
  tokenCount: number;
  challenge: ObjectId;
  at: Date;
  testIndex: number;
  result: string;
  intermediates: string[];
  success: boolean;
  profile: ObjectId;
}

const TestRunSchema = new mongoose.Schema<ITestRun>({
  prompts: { type: [String], required: true },
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
  intermediates: { type: [String], default: [] },
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

export interface ILike {
  profile: ObjectId;
  at: Date;
}

const LikeSchema = new mongoose.Schema<ILike>({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  at: { type: Date, required: true, default: Date.now },
});

export interface IScore {
  score: number;
  run: ObjectId;
}

const ScoreSchema = new mongoose.Schema<IScore>({
  score: { type: Number, required: true },
  run: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Run",
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

export interface IChallenge {
  name: string;
  description: string;
  tests: ITest[];
  createdAt: Date;
  createdBy: ObjectId;
  likes?: ILike[];
  scores?: IScore[];
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
  createdAt: { type: Date, required: true, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  likes: { type: [LikeSchema], default: [] },
  scores: { type: [ScoreSchema], default: [] },
});

const Challenge =
  (mongoose.models.Challenge as mongoose.Model<IChallenge>) ||
  mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export interface IProfile {
  email: string;
  name: string;
  image: string;
  // The idea is to use the newUser field for deciding whether to show the tutorial or not
  // (the tutorial does not exist yet)
  newUser: boolean;
  joined: Date;
}

const ProfileSchema = new mongoose.Schema<IProfile>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  newUser: { type: Boolean, required: true, default: true },
  joined: { type: Date, required: true, default: Date.now },
});

const Profile =
  (mongoose.models.Profile as mongoose.Model<IProfile>) ||
  mongoose.model<IProfile>("Profile", ProfileSchema);

type IScoring = {
  scores: number[];
};

const ScoringSchema = new mongoose.Schema<IScoring>({
  scores: { type: [Number], required: true },
});

const Scoring =
  (mongoose.models.Scoring as mongoose.Model<IScoring>) ||
  mongoose.model<IScoring>("Scoring", ScoringSchema);

export { Profile, Challenge, Run, TestRun, Scoring };
