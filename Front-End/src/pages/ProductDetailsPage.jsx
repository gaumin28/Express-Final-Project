import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/useAuth";
import {
  getProductById,
  getProducts,
  getProductReviews,
  createReview,
  deleteReview,
} from "../services/api";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProductData() {
      try {
        const [productData, productsData] = await Promise.all([
          getProductById(id),
          getProducts(),
        ]);
        if (!cancelled) {
          setProduct(productData);
          setAllProducts(productsData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    loadProductData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const { reviews: reviewsData } = await getProductReviews(id);
        if (!cancelled) {
          setReviews(reviewsData);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Loading product…</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link
          to="/shop"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast({
      message: `${quantity > 1 ? quantity + "× " : ""}${product.name} added to cart!`,
      type: "success",
    });
  }

  function handleToggleWishlist() {
    const wasWishlisted = isWishlisted(product.id);
    toggleWishlist(product);
    toast({
      message: wasWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist! ♥`,
      type: wasWishlisted ? "info" : "success",
    });
  }

  return (
    <div className="space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-indigo-600">
          Shop
        </Link>
        <span>/</span>
        <span className="text-slate-800">{product.name}</span>
      </nav>

      {/* Product details */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src={product.image}
            alt={product.name}
            className="h-96 w-full object-cover lg:h-120"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-slate-500">
                {product.rating} · {reviews.length} reviews
              </span>
            </div>
          </div>

          <p className="text-3xl font-extrabold text-slate-900">
            ${product.price}
          </p>

          <p className="leading-relaxed text-slate-600">
            {product.description}
          </p>

          {/* Stock */}
          <p
            className={`text-sm font-medium ${product.stock - quantity <= 10 ? "text-red-500" : "text-emerald-600"}`}
          >
            {product.stock - quantity <= 0
              ? `✗ Not enough stock`
              : product.stock - quantity <= 10
                ? `⚠ Only ${product.stock - quantity} left in stock`
                : `✓ In stock (${product.stock - quantity} available)`}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Qty:</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition rounded-l-xl"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition rounded-r-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Add to cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${wishlisted ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>

          {/* Details card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            {[
              { icon: "🚚", label: "Free delivery", sub: "On orders over $50" },
              { icon: "↩", label: "30-day returns", sub: "No questions asked" },
              {
                icon: "🔒",
                label: "Secure checkout",
                sub: "SSL encrypted payment",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Customer reviews</h2>
          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Write a review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Write your review</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="transition hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-8 w-8 ${
                        star <= reviewForm.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Your review
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                rows={4}
                placeholder="Share your thoughts about this product..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewForm({ rating: 5, comment: "" });
                }}
                disabled={submittingReview}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!reviewForm.comment.trim()) {
                    toast({
                      message: "Please write a review comment",
                      type: "error",
                    });
                    return;
                  }
                  setSubmittingReview(true);
                  try {
                    const newReview = await createReview(id, reviewForm);
                    setReviews([newReview, ...reviews]);
                    setShowReviewForm(false);
                    setReviewForm({ rating: 5, comment: "" });
                    toast({
                      message: "Review submitted successfully!",
                      type: "success",
                    });
                    // Refresh product data to update rating
                    const updatedProduct = await getProductById(id);
                    setProduct(updatedProduct);
                  } catch (error) {
                    toast({
                      message: error.message || "Failed to submit review",
                      type: "error",
                    });
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                disabled={submittingReview}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <p className="text-center text-slate-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-slate-500">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {review.customerName[0]}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {review.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {review.date}
                    </span>
                    {user && review.customerId === user.id && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this review?",
                            )
                          ) {
                            try {
                              await deleteReview(review.id);
                              setReviews(
                                reviews.filter((r) => r.id !== review.id),
                              );
                              toast({
                                message: "Review deleted successfully",
                                type: "success",
                              });
                              // Refresh product data to update rating
                              const updatedProduct = await getProductById(id);
                              setProduct(updatedProduct);
                            } catch (error) {
                              toast({
                                message:
                                  error.message || "Failed to delete review",
                                type: "error",
                              });
                            }
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-sm leading-relaxed text-slate-600">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Related products</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                />
                <div className="p-4">
                  <p className="font-semibold text-slate-900 group-hover:text-indigo-600">
                    {p.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    ${p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetailsPage;
