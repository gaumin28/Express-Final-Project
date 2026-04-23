import ReviewModel from "../models/reviewModel.js";
import ProductModel from "../models/productModel.js";
import OrderModel from "../models/orderModel.js";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Get all reviews for a product
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid product ID");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [reviews, totalReviews] = await Promise.all([
      ReviewModel.find({ product: productId, isDeleted: false })
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      ReviewModel.countDocuments({ product: productId, isDeleted: false }),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      customerName: review.customer?.name || "Anonymous",
      customerId: review.customer?._id?.toString(),
      date: new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      createdAt: review.createdAt,
    }));

    return res.status(200).json({
      message: "success",
      reviews: formattedReviews,
      totalReviews,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    return next(error);
  }
};

// Create a review for a product
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.customer._id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid product ID");
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product || product.isDeleted) {
      throw createHttpError(404, "Product not found");
    }

    // Validate rating
    const numericRating = Number(rating);
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw createHttpError(400, "Rating must be an integer between 1 and 5");
    }

    // Validate comment
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      throw createHttpError(400, "Comment is required");
    }

    if (comment.trim().length > 1000) {
      throw createHttpError(400, "Comment must be 1000 characters or less");
    }

    // Check if customer has already reviewed this product
    const existingReview = await ReviewModel.findOne({
      product: productId,
      customer: customerId,
      isDeleted: false,
    });

    if (existingReview) {
      throw createHttpError(400, "You have already reviewed this product");
    }

    // Optional: Check if customer has purchased this product
    const hasPurchased = await OrderModel.findOne({
      customer: customerId,
      "items.productId": productId,
      status: { $in: ["Processing", "Shipped", "Delivered"] },
    });

    if (!hasPurchased) {
      throw createHttpError(
        403,
        "You must purchase this product before reviewing it",
      );
    }

    // Create review
    const review = await ReviewModel.create({
      product: productId,
      customer: customerId,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Update product rating and numReviews
    await updateProductRating(productId);

    const populatedReview = await ReviewModel.findById(review._id)
      .populate("customer", "name email")
      .lean();

    return res.status(201).json({
      message: "Review created successfully",
      review: {
        id: populatedReview._id.toString(),
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        customerName: populatedReview.customer?.name || "Anonymous",
        customerId: populatedReview.customer?._id?.toString(),
        date: new Date(populatedReview.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Update a review
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.customer._id;

    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid review ID");
    }

    const review = await ReviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    });

    if (!review) {
      throw createHttpError(404, "Review not found");
    }

    // Check if the review belongs to the customer
    if (review.customer.toString() !== customerId.toString()) {
      throw createHttpError(403, "You can only edit your own reviews");
    }

    // Update rating if provided
    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        throw createHttpError(400, "Rating must be an integer between 1 and 5");
      }
      review.rating = numericRating;
    }

    // Update comment if provided
    if (comment !== undefined) {
      if (typeof comment !== "string" || !comment.trim()) {
        throw createHttpError(400, "Comment cannot be empty");
      }
      if (comment.trim().length > 1000) {
        throw createHttpError(400, "Comment must be 1000 characters or less");
      }
      review.comment = comment.trim();
    }

    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    const populatedReview = await ReviewModel.findById(review._id)
      .populate("customer", "name email")
      .lean();

    return res.status(200).json({
      message: "Review updated successfully",
      review: {
        id: populatedReview._id.toString(),
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        customerName: populatedReview.customer?.name || "Anonymous",
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.customer._id;

    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid review ID");
    }

    const review = await ReviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    });

    if (!review) {
      throw createHttpError(404, "Review not found");
    }

    // Check if the review belongs to the customer or if user is admin
    if (
      review.customer.toString() !== customerId.toString() &&
      req.customer.role !== "admin"
    ) {
      throw createHttpError(403, "You can only delete your own reviews");
    }

    review.isDeleted = true;
    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await ReviewModel.find({
    product: productId,
    isDeleted: false,
  }).lean();

  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
      : 0;

  await ProductModel.findByIdAndUpdate(productId, {
    rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
    numReviews,
  });
}
