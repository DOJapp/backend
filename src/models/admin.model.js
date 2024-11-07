import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define a sub-schema for partner details
const partnerDetailsSchema = new mongoose.Schema({
  panNumber: {
    type: String,
    default: ""
  },
  panImage: {
    type: String,
    default: ""
  },
  aadharNumber: {
    type: String,
    default: ""
  },
  aadharFrontImage: {
    type: String,
    default: ""
  },
  aadharBackImage: {
    type: String,
    default: ""
  },
  document: [String],
  bankName: {
    type: String,
    default: ""
  },
  accountNumber: {
    type: String,
    default: ""
  },
  ifscCode: {
    type: String,
    default: ""
  },
  accountHolderName: {
    type: String,
    default: ""
  },
});

// Main admin schema
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      default: ""
    },
    email: {
      type: String,
      required: false,
      default: "",
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      default: ""
    },
    phone: {
      type: Number,
      required: false,
      default: "",
    },
    secondaryPhone: {
      type: Number,
      default: "",
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
      default: "",
      minlength: [10, 'PAN Number must be exactly 10 characters'],
      maxlength: [10, 'PAN Number must be exactly 10 characters'],
    },
    panImage: {
      type: String,
      default: ""
    },
    aadharNumber: {
      type: String,
      default: ""
    },
    aadharFrontImage: {
      type: String,
      default: ""
    },
    aadharBackImage: {
      type: String,
      default: ""
    },
    firmName: {
      type: String,
      default: ""
    },
    gstNumber: {
      type: String,
      default: ""
    },
    cinNumber: {
      type: String,
      default: ""
    },
    firmAddress: {
      type: String,
      default: ""
    },
    gstType: {
      type: String,
      default: ""
    },
    compositionType: {
      type: String,
      default: ""
    },
    cessType: {
      type: String,
      default: ""
    },
    goodsServiceType: {
      type: String,
      default: ""
    },
    percentage: {
      type: String,
      default: ""
    },
    bankName: {
      type: String,
      required: true,
      maxlength: 255,
      default: ""
    },
    accountNumber: {
      type: Number,
      required: true,
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
      default: ""
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
