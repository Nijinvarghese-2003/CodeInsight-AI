import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before importing routes/db
dotenv.config({ path: path.join(__dirname, ".env") });

import app from "./app.js";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
====================================
🚀 Server is running successfully
🌐 URL: http://localhost:${PORT}
====================================
`);
});