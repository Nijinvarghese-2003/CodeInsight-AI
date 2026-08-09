import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const createAdminAccount = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@campus.edu";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = "System Administrator";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(`\n⚠️ Admin user already exists with email: ${adminEmail}`);
      // Ensure role is admin and status is active
      existingAdmin.role = "admin";
      existingAdmin.status = "active";
      existingAdmin.isApproved = true;

      // Update password if specified
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();

      console.log(`✅ Admin credentials updated successfully!`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        status: "active",
        isApproved: true,
      });

      console.log(`\n🎉 Admin user created successfully!`);
    }

    console.log(`
===================================================
👑 ADMIN LOGIN CREDENTIALS:
---------------------------------------------------
📧 Email    : ${adminEmail}
🔑 Password : ${adminPassword}
===================================================
`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdminAccount();
