import express from "express";
import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "../controllers/reviewController.js";
import {
  validateCustomerToken,
  validateAdminRole,
} from "../middlewares/customerMiddleware.js";

const reviewRouter = express.Router();

// Get reviews for a product (public)
reviewRouter.get("/products/:productId", getProductReviews);

// Create a review (authenticated customers only)
reviewRouter.post("/products/:productId", validateCustomerToken, createReview);

// Update a review (owner only)
reviewRouter.put("/:reviewId", validateCustomerToken, updateReview);

// Delete a review (owner or admin)
reviewRouter.delete("/:reviewId", validateCustomerToken, deleteReview);

export default reviewRouter;
