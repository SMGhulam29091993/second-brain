import mongoose from "mongoose";

export enum ContentType {
  VIDEO = "video",
  IMAGE = "image",
  AUDIO = "audio",
  Article = "article",
}

export enum ContentSource {
  YOUTUBE = "youtube",
  VIMEO = "vimeo",
  SPOTIFY = "spotify",
  SOUNDCLOUD = "soundcloud",
  TWITTER = "twitter",
  FACEBOOK = "facebook",
  LINKEDIN = "linkedin",
  GITHUB = "github",
}

const contentSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ContentType,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tag",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ContentSource,
      required: true,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);
export default Content;
