import mongoose from "mongoose";
import Task from "../models/Task.js";

const validateTaskReferences = async (data) => {
  if (data.assignedTo) {
    const userExists = await mongoose.model("User").exists({ _id: data.assignedTo });
    if (!userExists) {
      throw new Error("Assigned user not found");
    }
  }

  const hasRelatedType = !!data.relatedType;
  const hasRelatedTo = !!data.relatedTo;

  if ((hasRelatedType && !hasRelatedTo) || (!hasRelatedType && hasRelatedTo)) {
    throw new Error("relatedType aur relatedTo dono saath required hain");
  }

  if (hasRelatedType && hasRelatedTo) {
    const relatedExists = await mongoose
      .model(data.relatedType)
      .exists({ _id: data.relatedTo });

    if (!relatedExists) {
      throw new Error(`${data.relatedType} not found`);
    }
  }
};

export const createTaskService = async (data, user) => {
  await validateTaskReferences(data);

  return await Task.create({
    ...data,
    createdBy: user._id,
    createdByName: user.name,
    createdByRole: user.role,
  });
};

export const getTaskService = async (user) => {
  if (user.role === "admin") {
    return await Task.find({ isDeleted: false })
      .populate("assignedTo", "name email role")
      .populate("relatedTo");
  }

  return await Task.find({
    isDeleted: false,
    assignedTo: user._id,
  })
    .populate("assignedTo", "name email role")
    .populate("relatedTo");
};

export const updateTaskService = async (taskId, data, user) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  if (user.role === "sales") {
    if (task.assignedTo.toString() !== user._id.toString()) {
      throw new Error("You are not allowed to update this task");
    }

    const allowedFields = ["status", "notes"];

    Object.keys(data).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete data[key];
      }
    });
  }

  const validationPayload = {
    assignedTo: data.assignedTo ?? task.assignedTo,
    relatedType:
      data.relatedType !== undefined ? data.relatedType : task.relatedType,
    relatedTo: data.relatedTo !== undefined ? data.relatedTo : task.relatedTo,
  };

  await validateTaskReferences(validationPayload);

  Object.assign(task, data);
  return await task.save();
};

export const deleteTaskService = async (taskId, user) => {
  if (user.role !== "admin") {
    throw new Error("Only admin can delete tasks");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  task.isDeleted = true;
  return await task.save();
};

export const getTaskStatsService = async (user) => {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const endOfMonth = new Date();

  let myCreatedTasksThisMonth;
  let totalTasks;
  let totalAssignedTasks;
  let assignedTasksThisMonth;

  if (user.role === "admin") {
    // Admins see system-wide task overview metrics
    myCreatedTasksThisMonth = await Task.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    });
    totalTasks = await Task.countDocuments({ isDeleted: false });
    totalAssignedTasks = await Task.countDocuments({
      isDeleted: false,
      assignedTo: { $ne: null },
    });
    assignedTasksThisMonth = await Task.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    });
  } else {
    // Sales users see their own dashboard stats
    myCreatedTasksThisMonth = await Task.countDocuments({
      createdBy: user._id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    });
    totalTasks = await Task.countDocuments({
      assignedTo: user._id,
      isDeleted: false,
    });
    totalAssignedTasks = await Task.countDocuments({
      assignedTo: user._id,
      isDeleted: false,
    });
    assignedTasksThisMonth = await Task.countDocuments({
      assignedTo: user._id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    });
  }

  return {
    myCreatedTasksThisMonth,
    totalTasks,
    totalAssignedTasks,
    assignedTasksThisMonth,
  };
};
