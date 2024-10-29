import mongoose from "mongoose";

// Define a sub-schema for opening hours
const openingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)\s?(AM|PM)?$/.test(v),
      message: (props) => `${props.value} is not a valid opening time!`,
    },
  },
  close: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)\s?(AM|PM)?$/.test(v),
      message: (props) => `${props.value} is not a valid closing time!`,
    },
  },
});

// Define a sub-schema for the address
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
});

// Define the sub-schema for reviews
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500, // Limit comment length
  },
  date: {
    type: Date,
    default: Date.now,
  },
});



// Define the main Store schema
const storeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      unique: true,
    },
    address: addressSchema,
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    storeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreCategory",
      required: true,
    },

    tagId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: false,
      },
    ],
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    openingHours: {
      monday: openingHoursSchema,
      tuesday: openingHoursSchema,
      wednesday: openingHoursSchema,
      thursday: openingHoursSchema,
      friday: openingHoursSchema,
      saturday: openingHoursSchema,
      sunday: openingHoursSchema,
    },
    reviews: [reviewSchema], // Use the defined review schema
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "Store",
    timestamps: true,
  }
);

// Middleware to filter out soft-deleted Store
const filterDeleted = function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
};

// Apply the filter to relevant queries
storeSchema.pre("find", filterDeleted);
storeSchema.pre("findOne", filterDeleted);
storeSchema.pre("findOneAndUpdate", filterDeleted);
storeSchema.pre("findByIdAndUpdate", filterDeleted);

// Middleware to update average rating before saving the store
storeSchema.methods.updateAverageRating = function () {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = totalRating / this.reviews.length;
  } else {
    this.averageRating = 0;
  }
};

// Create and export the store model
export const Store = mongoose.model("Store", storeSchema);
