//Modules
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import http from "http";
import {Server} from "socket.io";

//Database
import connectDB from "./config/db.js";

//Routes
import userRoutes from "./routes/userRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

//middlewares
import {NotFound, ErrorMiddleware} from "./middlewares/errorMiddleware.js";

//Scheduled function (once a day)
import {drugExpiringNotification} from "./controllers/drugController.js";
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      await drugExpiringNotification();
    } catch (error) {
      console.error("Error executing function:", error);
    }
  },
  {
    scheduled: true,
    timeZone: "Africa/Addis_Ababa",
  }
);

//Configs
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cosr: {
    origin: process.env.CLIENT_URL,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

//Routes
app.use("/api/user", userRoutes);
app.use("/api/drug", drugRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/notification", notificationRoutes);

app.use(NotFound);
app.use(ErrorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
