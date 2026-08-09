import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"], // e.g. B.Tech Computer Science & Engineering
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course code is required"], // e.g. BTECH-CSE
      trim: true,
      unique: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    durationYears: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
