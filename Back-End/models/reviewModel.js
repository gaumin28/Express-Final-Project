import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate reviews from same user on same product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });
reviewSchema.index({ product: 1, isDeleted: 1, createdAt: -1 });

const ReviewModel = mongoose.model("reviews", reviewSchema);

export default ReviewModel;
