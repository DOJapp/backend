import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define a sub-schema for bank details
const bankDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountNo: String,
  ifscCode: String,
  accountHolderName: String,
  accountType: String,
});

// Define a sub-schema for personal identification details (common fields)
const personalDetailsSchema = new mongoose.Schema({
  panNo: { type: String, required: true },
  panImage: { type: String, required: true },
  aadharNo: { type: String, required: true },
  aadharFrontImage: { type: String, required: true },
  aadharBackImage: { type: String, required: true },
});

// Define a sub-schema for GST details
const gstDetailsSchema = new mongoose.Schema({
  gstFirmName: {
    type: String,
    required: function () {
      return this.gst === "Yes";
    },
  },
  gstNumber: {
    type: String,
    required: function () {
      return this.gst === "Yes";
    },
  },
  address: {
    type: String,
    required: function () {
      return this.gst === "Yes";
    },
  },
  composition: {
    type: String,
    required: function () {
      return this.gst === "Yes";
    },
  },
  document: [String],
});

// Define a sub-schema for partner details
const partnerDetailsSchema = new mongoose.Schema({
  noOfPartner: String,
  bankDetails: bankDetailsSchema,
  document: [String],
});

// Main admin schema
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    gst: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    firmType: {
      type: String,
      enum: ["Propriter", "Partnership", "LLP", "PVT LTD", "Limited"],
    },
    gstDetails: gstDetailsSchema,
    propriterDetails: personalDetailsSchema.add({
      bankDetails: bankDetailsSchema,
      document: [String],
    }),
    partnershipDetails: personalDetailsSchema.add({
      bankDetails: bankDetailsSchema,
      partnerDetails: partnerDetailsSchema,
      document: [String],
    }),
    llpDetails: personalDetailsSchema.add({
      bankDetails: bankDetailsSchema,
      partnerDetails: partnerDetailsSchema,
      document: [String],
      cinNo: String,
    }),
    pvtLtdDetails: personalDetailsSchema.add({
      bankDetails: bankDetailsSchema,
      partnerDetails: partnerDetailsSchema,
      document: [String],
      cinNo: String,
    }),
    limitedDetails: personalDetailsSchema.add({
      bankDetails: bankDetailsSchema,
      partnerDetails: partnerDetailsSchema,
      document: [String],
      cinNo: String,
    }),
  },
  { collection: "Admin", timestamps: true }
);

// Schema for cases without GST
const withoutGstSchema = new mongoose.Schema({
  firmName: String,
  firmAddress: String,
  bankDetails: bankDetailsSchema,
  document: [String],
  personalDetails: personalDetailsSchema,
});

// Custom validation for GST and firm type details
adminSchema.pre("validate", function (next) {
  if (this.gst === "Yes") {
    // Validate GST details
    if (
      !this.gstDetails ||
      !this.gstDetails.gstFirmName ||
      !this.gstDetails.gstNumber
    ) {
      return next(new Error("GST details are required when GST is Yes"));
    }

    // Validate firm type
    if (!this.firmType) {
      return next(new Error("Firm type is required when GST is Yes"));
    }

    // Validate firm type specific details
    if (this.firmType === "Propriter") {
      if (!this.propriterDetails.panNo || !this.propriterDetails.panImage) {
        return next(new Error("Propriter details are required"));
      }
    } else if (this.firmType === "Partnership") {
      if (!this.partnershipDetails.panNo || !this.partnershipDetails.panImage) {
        return next(new Error("Partnership details are required"));
      }
    } else if (this.firmType === "LLP") {
      if (!this.llpDetails.panNo || !this.llpDetails.panImage) {
        return next(new Error("LLP details are required"));
      }
    } else if (this.firmType === "PVT LTD") {
      if (!this.pvtLtdDetails.panNo || !this.pvtLtdDetails.panImage) {
        return next(new Error("PVT LTD details are required"));
      }
    } else if (this.firmType === "Limited") {
      if (!this.limitedDetails.panNo || !this.limitedDetails.panImage) {
        return next(new Error("Limited details are required"));
      }
    }
  } else {
    // If GST is "No", validate fields for without GST schema
    if (!this.withoutGstDetails) {
      return next(new Error("Details are required when GST is No"));
    }
  }
  next();
});

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
export const WithoutGst = mongoose.model("WithoutGst", withoutGstSchema);
