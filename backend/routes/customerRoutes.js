import express from "express";

import {isAuth} from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createCustomer, deleteCustomer, getCustomers, getCustomerStatus, updateCustomer,  getCustomersForDropdown } from "../controllers/customerController.js";


const customerRouter = express.Router();

customerRouter.post("/create-customer",
   isAuth
  ,authorizeRoles("admin", "sales"),
   createCustomer
  );

  customerRouter.get("/get-customers",
      isAuth,
      authorizeRoles("admin", "sales"),
      getCustomers
  );

  customerRouter.put("/update-customer/:id",
      isAuth,
      authorizeRoles("admin", "sales"),
      updateCustomer
  );

customerRouter.delete("/delete-customer/:id",
    isAuth,
    authorizeRoles("admin"),
    deleteCustomer
);

customerRouter.get("/customer-status",
    isAuth,
    authorizeRoles("admin", "sales"),
    getCustomerStatus
);

customerRouter.get(
  "/dropdown",
  isAuth,
  authorizeRoles("admin", "sales"),
  getCustomersForDropdown
);


export default customerRouter;