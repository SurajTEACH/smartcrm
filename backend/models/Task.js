import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedType",
    },

    relatedType: {
      type: String,
      enum: ["Lead", "Customer"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Completed"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    dueDate: {
      type: Date,
    },

    reminder: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },

    createdByName: String,

    createdByRole: {
      type: String,
      enum: ["admin", "sales"],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
