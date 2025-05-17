import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Source = mongoose.model("Source", sourceSchema);
export default Source;
