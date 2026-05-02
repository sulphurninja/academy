import mongoose, { Schema, Document } from "mongoose";

/**
 * Lessons authored from the admin panel. The (weekSlug, lessonSlug) pair
 * matches the curriculum spine in `lib/curriculum.ts`. Admins fill in the
 * video URL, supplemental resources, and the quiz payload here.
 */

export interface IQuizQuestion {
  id: string;
  type: "mcq" | "multi" | "short";
  prompt: string;
  options?: string[]; // for mcq / multi
  correct: string[]; // option text(s) or accepted answer(s)
  explain?: string;
  points: number;
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  weekSlug: string;
  lessonSlug: string;
  title: string;
  summary: string;
  videoUrl?: string; // mp4, m3u8, youtube, vimeo
  videoProvider?: "youtube" | "vimeo" | "mp4" | "hls";
  durationSeconds?: number;
  /** Rich text / markdown content for the "Read" tab. */
  content?: string;
  /** Estimated reading time in minutes (auto-calculated or manual). */
  readingTimeMinutes?: number;
  resources?: { label: string; url: string }[];
  challenge?: string; // ChallengeKind
  quiz?: {
    passScore: number; // 0..1
    xpOnPass: number;
    xpOnPerfect: number;
    questions: IQuizQuestion[];
  };
  xpVideoComplete: number;
  isPublished: boolean;
  authorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["mcq", "multi", "short"], required: true },
    prompt: { type: String, required: true },
    options: [String],
    correct: { type: [String], default: [] },
    explain: String,
    points: { type: Number, default: 10 },
  },
  { _id: false }
);

const LessonSchema = new Schema<ILesson>(
  {
    weekSlug: { type: String, required: true, index: true },
    lessonSlug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    videoUrl: String,
    videoProvider: {
      type: String,
      enum: ["youtube", "vimeo", "mp4", "hls"],
      default: "youtube",
    },
    durationSeconds: Number,
    content: { type: String, default: "" },
    readingTimeMinutes: Number,
    resources: [{ label: String, url: String }],
    challenge: String,
    quiz: {
      passScore: { type: Number, default: 0.7 },
      xpOnPass: { type: Number, default: 100 },
      xpOnPerfect: { type: Number, default: 250 },
      questions: { type: [QuizQuestionSchema], default: [] },
    },
    xpVideoComplete: { type: Number, default: 50 },
    isPublished: { type: Boolean, default: false, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LessonSchema.index({ weekSlug: 1, lessonSlug: 1 }, { unique: true });

export default (mongoose.models.Lesson as mongoose.Model<ILesson>) ||
  mongoose.model<ILesson>("Lesson", LessonSchema);
