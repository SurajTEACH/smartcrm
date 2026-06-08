import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    company: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      enum: [
        "Website",
        "Referral",
        "Facebook",
        "LinkedIn",
        "Instagram",
        "Twitter",
        "Manual",
      ],
      default: "Manual",
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Not_Interested", "Converted"],
      default: "New",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    closedAt: Date,
    nextFollowUp: Date,
    notes: String,

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
