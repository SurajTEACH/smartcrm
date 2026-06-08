import {
  deleteTaskService,
  getTaskService,
  updateTaskService,
  createTaskService,
  getTaskStatsService,
} from "../services/taskService.js";

export const createTask = async (req, res) => {
  try {
    const task = await createTaskService(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await getTaskService(req.user);
    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await updateTaskService(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    await deleteTaskService(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const stats = await getTaskStatsService(req.user);

    res.status(200).json({
      success: true,
      message: "Task stats fetched successfully",
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



