/**
 * SmartCRM — High-Fidelity MongoDB Atlas Seed Script
 * Populates 10 Users, 35 Leads, 20 Customers, and 30 Tasks.
 * Distributes records over the past 8 months to generate complete, realistic charts & metrics.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// Models
import User from "./models/User.js";
import Lead from "./models/Lead.js";
import Customer from "./models/Customer.js";
import Task from "./models/Task.js";

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://surajbpl307_db_user:Suraj95160@cluster0.sc8dttz.mongodb.net/smartcrm?retryWrites=true&w=majority&appName=Cluster0";

const hashPassword = async (p) => await bcrypt.hash(p, 12);

// Date helper: returns a date in the specified month relative to now (0 = current month, 1 = last month, etc.)
const getDateInPastMonth = (monthsAgo, dayOffset = 15) => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOffset);
  // Cap at current time if it's the current month
  return targetDate > now ? now : targetDate;
};

async function seed() {
  console.log("\n🌱 Starting MNC-Grade SmartCRM Database Seeding...\n");

  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB Connected successfully.");

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Task.deleteMany({}),
  ]);
  console.log("🗑️  Old records purged from all collections.");

  // 1. Seed Users (2 Admins + 8 Sales reps)
  const usersData = [
    { name: "Arjun Sharma", email: "arjun@smartcrm.com", role: "admin", dept: "Management", phone: "9876543210" },
    { name: "Priya Mehta", email: "priya@smartcrm.com", role: "admin", dept: "Operations", phone: "9876543211" },
    { name: "Rohit Verma", email: "rohit@smartcrm.com", role: "sales", dept: "Sales", phone: "9876543212" },
    { name: "Sneha Patel", email: "sneha@smartcrm.com", role: "sales", dept: "Sales", phone: "9876543213" },
    { name: "Karan Singh", email: "karan@smartcrm.com", role: "sales", dept: "Business Dev", phone: "9876543214" },
    { name: "Anjali Gupta", email: "anjali@smartcrm.com", role: "sales", dept: "Sales", phone: "9876543215" },
    { name: "Vikram Joshi", email: "vikram@smartcrm.com", role: "sales", dept: "Enterprise", phone: "9876543216" },
    { name: "Pooja Rani", email: "pooja@smartcrm.com", role: "sales", dept: "Sales", phone: "9876543217" },
    { name: "Amit Tiwari", email: "amit@smartcrm.com", role: "sales", dept: "Inside Sales", phone: "9876543218" },
    { name: "Neha Kapoor", email: "neha@smartcrm.com", role: "sales", dept: "Sales", phone: "9876543219" },
  ];

  const hashedUsers = await Promise.all(
    usersData.map(async (u, idx) => ({
      name: u.name,
      email: u.email,
      password: await hashPassword("SmartCRM@123"),
      role: u.role,
      phone: u.phone,
      department: u.dept,
      isActive: true,
      lastLogin: new Date(Date.now() - idx * 12 * 3600 * 1000), // staggered logins
    }))
  );

  const users = await User.insertMany(hashedUsers);
  console.log(`👥 Seeded ${users.length} Users successfully.`);

  const admin1 = users[0];
  const admin2 = users[1];
  const salesUsers = users.slice(2); // 8 reps

  // Helper to get random sales user
  const getRandomSalesUser = () => salesUsers[Math.floor(Math.random() * salesUsers.length)];

  // Helper to get random creator
  const getRandomCreator = () => (Math.random() > 0.5 ? admin1 : admin2);

  // 2. Seed Customers (20)
  // Let's create customers distributed across the past 8 months
  const customerList = [
    { name: "Rajesh Kumar", email: "rajesh.customer@techcorp.in", phone: "9811234567", company: "TechCorp India", monthsAgo: 7, day: 5 },
    { name: "Anita Sharma", email: "anita.cust@cloudbiz.in", phone: "9866789012", company: "CloudBiz India", monthsAgo: 7, day: 20 },
    { name: "Sanjay Bhatt", email: "sanjay@infratech.com", phone: "9712345678", company: "InfraTech", monthsAgo: 6, day: 10 },
    { name: "Ritu Agarwal", email: "ritu@pixelmind.co.in", phone: "9723456789", company: "PixelMind", monthsAgo: 6, day: 25 },
    { name: "Harish Pandey", email: "harish@logismart.io", phone: "9734567890", company: "LogiSmart", monthsAgo: 5, day: 12 },
    { name: "Divya Kapoor", email: "divya@medisys.in", phone: "9745678901", company: "MediSys", monthsAgo: 5, day: 28 },
    { name: "Narendra Rao", email: "narendra@buildpro.com", phone: "9756789012", company: "BuildPro", monthsAgo: 4, day: 8 },
    { name: "Sarika Jain", email: "sarika@fashionhub.co", phone: "9767890123", company: "FashionHub", monthsAgo: 4, day: 22 },
    { name: "Praveen Shetty", email: "praveen@edutech.in", phone: "9778901234", company: "EduTech India", monthsAgo: 3, day: 14 },
    { name: "Mamta Singh", email: "mamta@cleanenergyco.com", phone: "9789012345", company: "CleanEnergy Co", monthsAgo: 3, day: 29 },
    { name: "Vinod Joshi", email: "vinod@joshitransport.com", phone: "9912345678", company: "Joshi Transport", monthsAgo: 2, day: 4 },
    { name: "Geeta Rao", email: "geeta@raoconsulting.com", phone: "9923456789", company: "Rao Consulting", monthsAgo: 2, day: 18 },
    { name: "Deepak Rawat", email: "deepak@rawatfoods.in", phone: "9934567890", company: "Rawat Foods", monthsAgo: 2, day: 26 },
    { name: "Aditi Sen", email: "aditi@sensolutions.in", phone: "9945678901", company: "Sen Solutions", monthsAgo: 1, day: 9 },
    { name: "Vikrant Patil", email: "vikrant@patilbuild.com", phone: "9956789012", company: "Patil Builders", monthsAgo: 1, day: 16 },
    { name: "Neha Deshmukh", email: "neha@deshmukhlabs.in", phone: "9967890123", company: "Deshmukh Labs", monthsAgo: 1, day: 24 },
    { name: "Sunil Verma", email: "sunil@vermaagency.com", phone: "9978901234", company: "Verma Agency", monthsAgo: 0, day: 2 },
    { name: "Kavita Bisht", email: "kavita@bishtventures.com", phone: "9989012345", company: "Bisht Ventures", monthsAgo: 0, day: 8 },
    { name: "Alok Gupta", email: "alok@guptatraders.in", phone: "9990123456", company: "Gupta Traders", monthsAgo: 0, day: 14 },
    { name: "Shalini Iyer", email: "shalini@iyertech.co", phone: "9901234567", company: "Iyer Technologies", monthsAgo: 0, day: 22 },
  ];

  const customersToInsert = customerList.map((c) => {
    const creator = getRandomCreator();
    return {
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      createdBy: creator._id,
      createdByName: creator.name,
      createdByRole: "admin",
      isDeleted: false,
      createdAt: getDateInPastMonth(c.monthsAgo, c.day),
      updatedAt: getDateInPastMonth(c.monthsAgo, c.day),
    };
  });

  const customers = await Customer.insertMany(customersToInsert);
  console.log(`🏢 Seeded ${customers.length} Customers successfully.`);

  // 3. Seed Leads (35)
  // Let's create leads with varying statuses, sources, and months ago creation dates
  const leadList = [
    // Month 7
    { name: "Rajesh Kumar", email: "rajesh.kumar@techcorp.in", phone: "9811234567", company: "TechCorp India", source: "LinkedIn", status: "Converted", monthsAgo: 7, day: 2, notes: "Highly interested in Enterprise package." },
    { name: "Anita Sharma", email: "anita@cloudbiz.in", phone: "9866789012", company: "CloudBiz India", source: "LinkedIn", status: "Converted", monthsAgo: 7, day: 15, notes: "Closed by Rohit. Handover complete." },
    
    // Month 6
    { name: "Sanjay Bhatt", email: "sanjay@infratech.com", phone: "9712345678", company: "InfraTech", source: "Website", status: "Converted", monthsAgo: 6, day: 8, notes: "Website demo call went perfectly." },
    { name: "Ritu Agarwal", email: "ritu@pixelmind.co.in", phone: "9723456789", company: "PixelMind", source: "Referral", status: "Converted", monthsAgo: 6, day: 20, notes: "Referred by Priya. VIP customer." },
    { name: "Kunal Shah", email: "kunal@shahlogistics.in", phone: "9612345678", company: "Shah Logistics", source: "Manual", status: "Not_Interested", monthsAgo: 6, day: 27, notes: "Budget issues, declined for now." },

    // Month 5
    { name: "Harish Pandey", email: "harish@logismart.io", phone: "9734567890", company: "LogiSmart", source: "Website", status: "Converted", monthsAgo: 5, day: 9, notes: "Closed after three follow ups." },
    { name: "Divya Kapoor", email: "divya@medisys.in", phone: "9745678901", company: "MediSys", source: "Facebook", status: "Converted", monthsAgo: 5, day: 22, notes: "Facebook ad lead. Responded instantly." },
    { name: "Rohan Malhotra", email: "rohan@malhotrabros.com", phone: "9623456789", company: "Malhotra Bros", source: "Instagram", status: "Interested", monthsAgo: 5, day: 25, notes: "Wants minor custom reporting adjustments." },

    // Month 4
    { name: "Narendra Rao", email: "narendra@buildpro.com", phone: "9756789012", company: "BuildPro", source: "Manual", status: "Converted", monthsAgo: 4, day: 5, notes: "Exhibition contact. Converted directly." },
    { name: "Sarika Jain", email: "sarika@fashionhub.co", phone: "9767890123", company: "FashionHub", source: "Instagram", status: "Converted", monthsAgo: 4, day: 19, notes: "Instagram DM conversion." },
    { name: "Vijay Chawla", email: "vijay@chawlatextiles.in", phone: "9634567890", company: "Chawla Textiles", source: "Website", status: "Contacted", monthsAgo: 4, day: 24, notes: "Sent product catalog via WhatsApp." },
    { name: "Pooja Hegde", email: "pooja@hegdeconsulting.in", phone: "9645678901", company: "Hegde Consulting", source: "LinkedIn", status: "New", monthsAgo: 4, day: 28, notes: "Added automatically via webhook." },

    // Month 3
    { name: "Praveen Shetty", email: "praveen@edutech.in", phone: "9778901234", company: "EduTech India", source: "Referral", status: "Converted", monthsAgo: 3, day: 10, notes: "Referred by Rajesh. Closed swiftly." },
    { name: "Mamta Singh", email: "mamta@cleanenergyco.com", phone: "9789012345", company: "CleanEnergy Co", source: "Website", status: "Converted", monthsAgo: 3, day: 25, notes: "Wants clean solar integration tracking." },
    { name: "Kishore Kumar", email: "kishore@kumarmusic.in", phone: "9656789012", company: "Kumar Music Production", source: "Twitter", status: "Interested", monthsAgo: 3, day: 28, notes: "Checking trial sandbox account currently." },
    { name: "Preeti Sinha", email: "preeti@sinhafoods.com", phone: "9667890123", company: "Sinha Foods", source: "Facebook", status: "Contacted", monthsAgo: 3, day: 29, notes: "Initial introductory call completed." },

    // Month 2
    { name: "Vinod Joshi", email: "vinod@joshitransport.com", phone: "9912345678", company: "Joshi Transport", source: "Manual", status: "Converted", monthsAgo: 2, day: 2 },
    { name: "Geeta Rao", email: "geeta@raoconsulting.com", phone: "9923456789", company: "Rao Consulting", source: "LinkedIn", status: "Converted", monthsAgo: 2, day: 15 },
    { name: "Deepak Rawat", email: "deepak@rawatfoods.in", phone: "9934567890", company: "Rawat Foods", source: "Website", status: "Converted", monthsAgo: 2, day: 25 },
    { name: "Manoj Bajpayee", email: "manoj@primevideo.in", phone: "9678901234", company: "Prime Video Agency", source: "Referral", status: "Interested", monthsAgo: 2, day: 27 },
    { name: "Swati Deshpande", email: "swati@deshmedia.co", phone: "9689012345", company: "Desh Media", source: "Website", status: "Not_Interested", monthsAgo: 2, day: 28 },

    // Month 1
    { name: "Aditi Sen", email: "aditi@sensolutions.in", phone: "9945678901", company: "Sen Solutions", source: "Website", status: "Converted", monthsAgo: 1, day: 8 },
    { name: "Vikrant Patil", email: "vikrant@patilbuild.com", phone: "9956789012", company: "Patil Builders", source: "Manual", status: "Converted", monthsAgo: 1, day: 14 },
    { name: "Neha Deshmukh", email: "neha@deshmukhlabs.in", phone: "9967890123", company: "Deshmukh Labs", source: "LinkedIn", status: "Converted", monthsAgo: 1, day: 22 },
    { name: "Abhishek Bachchan", email: "abhishek@juniorbachchan.in", phone: "9690123456", company: "KB Bachchans", source: "Facebook", status: "Interested", monthsAgo: 1, day: 24 },
    { name: "Rishabh Pant", email: "rishabh@cricketindia.org", phone: "9601234567", company: "Cricket Academy", source: "Instagram", status: "Contacted", monthsAgo: 1, day: 27 },
    { name: "Hardik Pandya", email: "hardik@allrounder.in", phone: "9512345678", company: "Pandya Fitness", source: "LinkedIn", status: "New", monthsAgo: 1, day: 29 },

    // Month 0 (This Month)
    { name: "Sunil Verma", email: "sunil@vermaagency.com", phone: "9978901234", company: "Verma Agency", source: "Website", status: "Converted", monthsAgo: 0, day: 2 },
    { name: "Kavita Bisht", email: "kavita@bishtventures.com", phone: "9989012345", company: "Bisht Ventures", source: "Manual", status: "Converted", monthsAgo: 0, day: 6 },
    { name: "Alok Gupta", email: "alok@guptatraders.in", phone: "9990123456", company: "Gupta Traders", source: "LinkedIn", status: "Converted", monthsAgo: 0, day: 12 },
    { name: "Shalini Iyer", email: "shalini@iyertech.co", phone: "9901234567", company: "Iyer Technologies", source: "Website", status: "Converted", monthsAgo: 0, day: 20 },
    { name: "Virat Kohli", email: "virat@runmachine.in", phone: "9523456789", company: "VK18 Enterprises", source: "Referral", status: "Interested", monthsAgo: 0, day: 22, notes: "Requested custom branding features." },
    { name: "Rohit Sharma", email: "rohit.hitman@cricket.in", phone: "9534567890", company: "Hitman Academy", source: "Instagram", status: "Contacted", monthsAgo: 0, day: 25, notes: "Scheduling meeting next Monday." },
    { name: "Jasprit Bumrah", email: "jasprit@yorkers.com", phone: "9545678901", company: "Yorker Bowling", source: "Twitter", status: "New", monthsAgo: 0, day: 27, notes: "Inbound Twitter query." },
    { name: "KL Rahul", email: "kl@classybats.in", phone: "9556789012", company: "Classy Bats", source: "Website", status: "New", monthsAgo: 0, day: 28, notes: "Webform signup." },
  ];

  const leadsToInsert = leadList.map((l, idx) => {
    const creator = getRandomCreator();
    const agent = salesUsers[idx % salesUsers.length];

    // Find linked customer if status is Converted
    let customerId = null;
    if (l.status === "Converted") {
      const foundCustomer = customers.find((c) => c.name === l.name);
      if (foundCustomer) {
        customerId = foundCustomer._id;
      }
    }

    return {
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company || "",
      source: l.source,
      status: l.status,
      assignedTo: agent._id,
      createdBy: creator._id,
      createdByName: creator.name,
      createdByRole: "admin",
      closedAt: l.status === "Converted" ? getDateInPastMonth(l.monthsAgo, l.day) : null,
      nextFollowUp: l.status !== "Converted" ? new Date(Date.now() + (idx + 1) * 2 * 86400000) : null,
      notes: l.notes || "Auto-seeded customer CRM record.",
      customerId: customerId,
      isDeleted: false,
      createdAt: getDateInPastMonth(l.monthsAgo, l.day),
      updatedAt: getDateInPastMonth(l.monthsAgo, l.day),
    };
  });

  const leads = await Lead.insertMany(leadsToInsert);
  console.log(`🎯 Seeded ${leads.length} Leads successfully.`);

  // 4. Seed Tasks (30)
  // Let's create realistic tasks assigned to sales agents, linked to leads or customers
  const taskList = [
    // Month 7
    { title: "Follow up call - TechCorp", description: "Establish contact and set setup details.", monthsAgo: 7, day: 4, status: "Completed", priority: "High", isLead: false, refIndex: 0 },
    { title: "Review requirements - CloudBiz", description: "Read CloudBiz workflow requests.", monthsAgo: 7, day: 18, status: "Completed", priority: "Medium", isLead: false, refIndex: 1 },

    // Month 6
    { title: "Prepare quote - InfraTech", description: "Draft the service quotes and SLAs.", monthsAgo: 6, day: 12, status: "Completed", priority: "High", isLead: false, refIndex: 2 },
    { title: "Send pricing doc - Kunal Shah", description: "Discuss pricing levels with Kunal.", monthsAgo: 6, day: 28, status: "Completed", priority: "Low", isLead: true, refIndex: 4 },

    // Month 5
    { title: "Initial call - LogiSmart", description: "First introduction call.", monthsAgo: 5, day: 14, status: "Completed", priority: "Medium", isLead: false, refIndex: 4 },
    { title: "Demo schedule - MediSys", description: "Schedule the system demo.", monthsAgo: 5, day: 24, status: "Completed", priority: "High", isLead: false, refIndex: 5 },

    // Month 4
    { title: "Contract discussion - BuildPro", description: "Coordinate with legal department.", monthsAgo: 4, day: 10, status: "Completed", priority: "High", isLead: false, refIndex: 6 },
    { title: "Proposal draft - FashionHub", description: "SLA draft presentation.", monthsAgo: 4, day: 24, status: "Completed", priority: "Medium", isLead: false, refIndex: 7 },

    // Month 3
    { title: "Welcome package - EduTech", description: "Deploy onboarding package.", monthsAgo: 3, day: 16, status: "Completed", priority: "Low", isLead: false, refIndex: 8 },
    { title: "Demo prep - Kishore Kumar", description: "Prepare specialized sandbox for trial.", monthsAgo: 3, day: 29, status: "Completed", priority: "Medium", isLead: true, refIndex: 14 },

    // Month 2
    { title: "Setup sandbox - Joshi Transport", description: "Configure custom database schemas.", monthsAgo: 2, day: 6, status: "Completed", priority: "High", isLead: false, refIndex: 10 },
    { title: "Billing config - Rao Consulting", description: "Finalize monthly subscription billing.", monthsAgo: 2, day: 20, status: "Completed", priority: "Medium", isLead: false, refIndex: 11 },

    // Month 1
    { title: "Negotiate contract - Sen Solutions", description: "Establish pricing discounts.", monthsAgo: 1, day: 11, status: "Completed", priority: "High", isLead: false, refIndex: 13 },
    { title: "Onboarding - Patil Builders", description: "Create portal logins for team members.", monthsAgo: 1, day: 18, status: "Completed", priority: "Low", isLead: false, refIndex: 14 },
    { title: "Call - Deshmukh Labs", description: "Follow up regarding custom SLA features.", monthsAgo: 1, day: 25, status: "Completed", priority: "High", isLead: false, refIndex: 15 },

    // Month 0 (Pending or In Progress tasks for this month)
    { title: "Follow up with Virat Kohli", description: "Call Virat regarding VK18 enterprise requirements.", monthsAgo: 0, day: 23, status: "In_Progress", priority: "High", isLead: true, refIndex: 32 },
    { title: "Schedule demo for Rohit Sharma", description: "Setup a Zoom call with Rohit and his coaching staff.", monthsAgo: 0, day: 26, status: "Pending", priority: "High", isLead: true, refIndex: 33 },
    { title: "Contact Jasprit Bumrah", description: "Respond to bowler's inbound academy requirements.", monthsAgo: 0, day: 28, status: "Pending", priority: "Medium", isLead: true, refIndex: 34 },
    { title: "Email follow-up - KL Rahul", description: "Acknowledge form signup and offer intro call.", monthsAgo: 0, day: 29, status: "Pending", priority: "Low", isLead: true, refIndex: 35 },
    { title: "Onboard Sunil Verma", description: "Initialize Sunil's agency login portal.", monthsAgo: 0, day: 3, status: "Completed", priority: "Medium", isLead: false, refIndex: 16 },
    { title: "Setup config - Kavita Bisht", description: "Install default templates.", monthsAgo: 0, day: 7, status: "Completed", priority: "Low", isLead: false, refIndex: 17 },
    { title: "Meeting with Alok Gupta", description: "Review custom export requirements.", monthsAgo: 0, day: 13, status: "Completed", priority: "High", isLead: false, refIndex: 18 },
    { title: "Deliver docs - Shalini Iyer", description: "Send user manual PDFs.", monthsAgo: 0, day: 21, status: "Completed", priority: "Low", isLead: false, refIndex: 19 },
    { title: "Monthly checkin - TechCorp", description: "Check in with Rajesh for feedback.", monthsAgo: 0, day: 28, status: "In_Progress", priority: "Medium", isLead: false, refIndex: 0 },
    { title: "Support ticket - CloudBiz", description: "Resolve API integration webhook dropouts.", monthsAgo: 0, day: 29, status: "Pending", priority: "High", isLead: false, refIndex: 1 },
  ];

  const tasksToInsert = taskList.map((t, idx) => {
    const creator = getRandomCreator();
    const agent = salesUsers[idx % salesUsers.length];

    // Get reference object
    let relatedTo = null;
    let relatedType = null;

    if (t.isLead) {
      if (leads[t.refIndex]) {
        relatedTo = leads[t.refIndex]._id;
        relatedType = "Lead";
      }
    } else {
      if (customers[t.refIndex]) {
        relatedTo = customers[t.refIndex]._id;
        relatedType = "Customer";
      }
    }

    return {
      title: t.title,
      description: t.description,
      relatedTo: relatedTo,
      relatedType: relatedType,
      assignedTo: agent._id,
      status: t.status,
      priority: t.priority,
      dueDate: new Date(Date.now() + (idx - 12) * 2 * 86400000), // distributes dates past & future
      reminder: new Date(Date.now() + (idx - 12) * 2 * 86400000 + 4 * 3600 * 1000),
      notes: "System generated action checklist item.",
      createdBy: creator._id,
      createdByName: creator.name,
      createdByRole: "admin",
      isDeleted: false,
      createdAt: getDateInPastMonth(t.monthsAgo, t.day),
      updatedAt: getDateInPastMonth(t.monthsAgo, t.day),
    };
  });

  const tasks = await Task.insertMany(tasksToInsert);
  console.log(`✅ Seeded ${tasks.length} Tasks successfully.`);

  // Print Summary
  console.log("\n" + "═".repeat(60));
  console.log("🏆  MNC-GRADE SMARTCRM DATA SEEDING COMPLETE!");
  console.log("═".repeat(60));
  console.log("\nℹ️  LOGIN DETAILS:");
  console.log("   Password for all: SmartCRM@123\n");
  console.log("   🔴 Admins:");
  console.log(`      arjun@smartcrm.com  (Arjun Sharma)`);
  console.log(`      priya@smartcrm.com  (Priya Mehta)`);
  console.log("\n   🟢 Selected Sales Representatives:");
  salesUsers.slice(0, 3).forEach((u) => {
    console.log(`      ${u.email}  (${u.name})`);
  });
  console.log("      ... and 5 other sales representatives.");
  console.log("\n💡  Charts & reports will now display full historical trend analytics.");
  console.log("═".repeat(60) + "\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed execution failed:", err.message);
  process.exit(1);
});
