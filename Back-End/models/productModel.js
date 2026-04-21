import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    slug: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Fashion",
        "Home",
        "Gaming",
        "Accessories",
        "Sports",
      ],
      default: "Electronics",
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      required: true,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 });
productSchema.index({ isDeleted: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({
  isDeleted: 1,
  category: 1,
  isFeatured: -1,
  createdAt: -1,
});
productSchema.index({ isDeleted: 1, category: 1, price: 1 });
productSchema.index({ isDeleted: 1, category: 1, rating: -1 });
productSchema.index({ name: 1 });

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;
