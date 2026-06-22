import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";

export const createCustomerService = async (data, user) => {
  return await Customer.create({
    ...data,

    // 🔥 auto fill
    createdBy: user._id,
    createdByName: user.name,
    createdByRole: user.role,
  });
};

export const getCustomersService = async (user) => {
    if (user.role === "admin") {
        return await Customer.find({ isDeleted: false });
    } else {
        const assignedLeads = await Lead.find({
            assignedTo: user._id,
            isDeleted: false,
            customerId: { $ne: null }
        }).select("customerId");

        const customerIds = assignedLeads.map(l => l.customerId);

        return await Customer.find({
            isDeleted: false,
            $or: [
                { createdBy: user._id },
                { _id: { $in: customerIds } }
            ]
        });
    }
};

export const updateCustomerService = async (id, data, user) => {
    let filter = { _id: id };

    if (user.role !== "admin") {
        const customer = await Customer.findOne({ _id: id, isDeleted: false });
        if (!customer) throw new Error("Customer not found");

        if (customer.createdBy?.toString() !== user._id.toString()) {
            const assignedLeadExists = await Lead.exists({
                assignedTo: user._id,
                customerId: id,
                isDeleted: false
            });

            if (!assignedLeadExists) {
                throw new Error("You are not allowed to update this customer");
            }
        }
    }

    return await Customer.findOneAndUpdate(
        filter,
        data,
        {
            new: true,
        }
    );
};

export const deleteCustomerService = async (id, user) => {
    let filter = { _id: id};

    if(user.role !== "admin") {
        throw new Error("Not allowed to delete");
    }

    return await Customer.findByIdAndUpdate( id, {
        isDeleted: true,
    });
};

// added  customers added in monthly

export const getMonthlyCustomersService = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return await Customer.countDocuments({
        createdAt: {
            $gte: startOfMonth,
            $lte: now,
       },
        isDeleted: false,
    });
    
}

export const totalCustomersService = async () => {
    return await Customer.countDocuments({ isDeleted: false });
}