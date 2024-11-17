import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users/index.routes.js";
import adminRouter from "./routes/admin/index.routes.js";
import storeRouter from "./routes/store/index.routes.js";
import logger from "./utils/logger.js";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));



app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Error logging middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

// Mount the user routes at /api/v1
app.use("/api/v1/users", userRouter);

// Mount the user routes at /api/v1
app.use("/api/v1/store", storeRouter);

// Mount the user routes at /api/v1
app.use("/api/v1/admin", adminRouter);

// Example route: http://localhost:8000/api/v1/users/login
export { app };
