import Lead from "../models/Lead.js";
import {
  createLeadService,
  deleteLeadService,
  getLeadsService,
  updateLeadService,
  getLeadStatsService,
  getRestoredLeadsService,
  restoreLeadService,
  permanentDeleteLeadService,
} from "../services/leadService.js";

// create lead
export const createLead = async (req, res) => {
  try {
    const lead = await createLeadService(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get leads
export const getLeads = async (req, res) => {
  try {
    const leads = await getLeadsService(req.user);

    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update lead
export const updateLead = async (req, res) => {
  try {
    const lead = await updateLeadService(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// soft delete
export const deleteLead = async (req, res) => {
  try {
    await deleteLeadService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// restore lead
export const restoreLead = async (req, res) => {
  try {
    const lead = await restoreLeadService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Lead restored successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// permanent delete
export const permanentDeleteLead = async (req, res) => {
  try {
    const lead = await permanentDeleteLeadService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Lead permanently deleted successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadStats = async (req, res) => {
  try {
    const stats = await getLeadStatsService(req.user);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadsForDropdown = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false }).lean();

    const formattedLeads = leads.map((lead) => ({
      _id: lead._id,
      name:
        lead.name ||
        lead.fullName ||
        lead.company ||
        lead.email ||
        "Unnamed Lead",
    }));

    res.status(200).json({
      success: true,
      leads: formattedLeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRestoredLeads = async (req, res) => {
  try {
    const leads = await getRestoredLeadsService(req.user);

    res.status(200).json({
      success: true,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
