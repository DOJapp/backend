import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define a sub-schema for partner details
const partnerDetailsSchema = new mongoose.Schema({
  panNumber: {
    type: String,
  },
  panImage: {
    type: String,
  },
  aadharNumber: {
    type: String,
  },
  aadharFrontImage: {
    type: String,
  },
  aadharBackImage: {
    type: String,
  },
  document: [String],
  bankName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  accountHolderName: {
    type: String,
  },
});

// Main admin schema
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      validate: {
        validator: (value) => /^\d{10}$/.test(value),
        message: "Invalid mobile number",
      },
    },
    secondaryPhone: {
      type: String,
      validate: {
        validator: (value) => /^\d{10}$/.test(value),
        message: "Invalid secondary mobile number",
      },
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    fcmToken: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    avatar: {
      type: String,
      default: "default.png",
    },
    gst: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    panNumber: {
      type: String,
      minlength: [10, 'PAN Number must be exactly 10 characters'],
      maxlength: [10, 'PAN Number must be exactly 10 characters'],
    },
    panImage: {
      type: String,
    },
    aadharNumber: {
      type: String,
    },
    aadharFrontImage: {
      type: String,
    },
    aadharBackImage: {
      type: String,
    },
    firmName: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    cinNumber: {
      type: String,
    },
    firmAddress: {
      type: String,
    },
    gstType: {
      type: String,
    },
    compositonType: {
      type: String,
    },
    cessType: {
      type: String,
    },
    goodsServiceType: {
      type: String,
    },
    percentage: {
      type: String,
    },
    bankName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    accountNumber: {
      type: String,
      required: true,
      match: /^[0-9]{12}$/,
    },
    ifscCode: {
      type: String,
      required: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    },
    accountHolderName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    accountType: {
      type: String,
    },
    documents: [String],
    firmType: {
      type: String,
      enum: ["Proprietor", "Partnership", "LLP", "PVT LTD", "Limited"],
    },
    partners: [partnerDetailsSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "Admin", timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to generate an access token
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

// Instance method to generate a refresh token
adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

// Middleware to filter out soft-deleted admins
const filterDeleted = function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
};

// Apply the filter to relevant queries
adminSchema.pre("find", filterDeleted);
adminSchema.pre("findOne", filterDeleted);
adminSchema.pre("findOneAndUpdate", filterDeleted);
adminSchema.pre("findByIdAndUpdate", filterDeleted);

export const Admin = mongoose.model("Admin", adminSchema);
