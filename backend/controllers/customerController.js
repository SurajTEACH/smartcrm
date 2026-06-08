import Customer from "../models/Customer.js";

import { createCustomerService, deleteCustomerService, getCustomersService, getMonthlyCustomersService, totalCustomersService, updateCustomerService } from "../services/customerService.js";

export const createCustomer = async (req, res) => {
  try {
    const customer = await createCustomerService(req.body, req.user);

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomers = async (req, res) => {
    try {
       const customers = await getCustomersService(req.user);
        res.json(customers);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await updateCustomerService(
            req.params.id,
            req.body,
            req.user
        );

        if(!customer){
            return res.status(404).json({
                 message: "Customer not found !"
            })
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        await deleteCustomerService(req.params.id, req.user);
        res.json({
            message: "Customer deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export const getCustomerStatus = async (req, res) => {
    
     try {
        const [totalCustomers, getMonthlyCustomers] = await Promise.all([
            totalCustomersService(),
            getMonthlyCustomersService()
        ]);

        res.json({
            totalCustomers,
            getMonthlyCustomers,
        });
     } catch (error) {
        res.status(500).json({
            message: error.message
        });
     }
    
}

export const getCustomersForDropdown = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .lean();

    const formattedCustomers = customers.map((customer) => ({
      _id: customer._id,
      name:
        customer.name ||
        customer.fullName ||
        customer.company ||
        customer.email ||
        "Unnamed Customer",
    }));

    res.status(200).json({
      success: true,
      customers: formattedCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};