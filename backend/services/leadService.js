import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";

const leadPopulateOptions = [
  {
    path: "assignedTo",
    select: "name email role",
  },
  {
    path: "customerId",
    select: "name email phone company",
  },
];

export const createLeadService = async (data, user) => {
  if (!data.assignedTo && user.role === "sales") {
    data.assignedTo = user._id;
  }

  const lead = await Lead.create({
    ...data,
    createdBy: user._id,
    createdByName: user.name,
    createdByRole: user.role,
  });

  return await Lead.findById(lead._id).populate(leadPopulateOptions);
};

// get leads
export const getLeadsService = async (user) => {
  if (user.role === "admin") {
    return await Lead.find({ isDeleted: false })
      .populate(leadPopulateOptions)
      .sort({ createdAt: -1 });
  }

  return await Lead.find({
    isDeleted: false,
    assignedTo: user._id,
  })
    .populate(leadPopulateOptions)
    .sort({ createdAt: -1 });
};

// update lead
export const updateLeadService = async (leadId, data, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) throw new Error("Lead not found");

  if (user.role === "sales") {
    if (lead.assignedTo?.toString() !== user._id.toString()) {
      throw new Error("Unauthorized");
    }
  }

  Object.assign(lead, data);

  // if Converted -> close date + customer create/link
  if (data.status === "Converted") {
    if (!lead.closedAt) {
      lead.closedAt = new Date();
    }

    let customer = await Customer.findOne({ email: lead.email });

    if (!customer) {
      customer = await Customer.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company || "",
        createdBy: user._id,
        createdByName: user.name,
        createdByRole: user.role,
      });
    }

    lead.customerId = customer._id;
  }

  const updatedLead = await lead.save();

  return await Lead.findById(updatedLead._id).populate(leadPopulateOptions);
};

// soft delete
export const deleteLeadService = async (leadId, user) => {
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  lead.isDeleted = true;
  lead.deletedAt = new Date();

  return await lead.save();
};

// restore soft deleted lead
export const restoreLeadService = async (leadId, user) => {
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  lead.isDeleted = false;
  lead.deletedAt = null;

  await lead.save();

  return await Lead.findById(lead._id).populate(leadPopulateOptions);
};

// permanent delete
export const permanentDeleteLeadService = async (leadId, user) => {
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  await Lead.findByIdAndDelete(leadId);

  return lead;
};

export const getLeadStatsService = async (user) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const totalLeads = await Lead.countDocuments({
    createdAt: { $gte: startOfMonth },
    isDeleted: false,
  });

  const closedLeads = await Lead.countDocuments({
    status: "Converted",
    closedAt: { $gte: startOfMonth },
    isDeleted: false,
  });

  const myLeadsQuery = {
    createdAt: { $gte: startOfMonth },
    isDeleted: false,
  };

  const myClosedQuery = {
    status: "Converted",
    closedAt: { $gte: startOfMonth },
    isDeleted: false,
  };

  if (user.role === "sales") {
    myLeadsQuery.assignedTo = user._id;
    myClosedQuery.assignedTo = user._id;
  } else {
    myLeadsQuery.createdBy = user._id;
    myClosedQuery.createdBy = user._id;
  }

  const myLeads = await Lead.countDocuments(myLeadsQuery);
  const myClosedLeads = await Lead.countDocuments(myClosedQuery);

  return {
    overall: {
      totalLeads,
      closedLeads,
    },
    myStats: {
      myLeads,
      myClosedLeads,
    },
  };
};

export const getRestoredLeadsService = async (user) => {
  if (user.role === "admin") {
    return await Lead.find({ isDeleted: true })
      .populate(leadPopulateOptions)
      .sort({ deletedAt: -1, updatedAt: -1 });
  }

  return await Lead.find({
    isDeleted: true,
    assignedTo: user._id,
  })
    .populate(leadPopulateOptions)
    .sort({ deletedAt: -1, updatedAt: -1 });
};
