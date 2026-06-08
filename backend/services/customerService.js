import Customer from "../models/Customer.js";

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
    if(user.role === "admin"){
        return await Customer.find({ isDeleted: false });
    } else {
        return await Customer.find({
           createdBy: user._id,
            isDeleted: false,
        })
    }
};

export const  updateCustomerService = async (id, data, user ) => {
    let filter = { _id: id};

    if(user.role !== "admin") {
        filter.createdBy = user._id;
    }

    return await Customer.findOneAndUpdate(
        filter,
        data,
        {
            new : true,
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