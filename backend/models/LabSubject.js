import mongoose from "mongoose";

const labSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lab subject name is required"], // e.g., C Programming Lab
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Lab subject code is required"], // e.g., CS101
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    // Strictly locked programming language for this lab subject
    requiredLanguage: {
      type: String,
      enum: ["c", "cpp", "java", "python", "javascript"],
      required: [true, "Required programming language is required"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const LabSubject = mongoose.model("LabSubject", labSubjectSchema);

export default LabSubject;
