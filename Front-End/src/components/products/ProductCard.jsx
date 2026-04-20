import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";

const FALLBACK_IMAGE_BY_CATEGORY = {
  Electronics:
    "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  Fashion:
    "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  Home: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  Gaming:
    "https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  Accessories:
    "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  Sports:
    "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
};

function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 shadow backdrop-blur transition hover:bg-white"
        aria-label="Toggle wishlist"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition ${wishlisted ? "fill-red-500 text-red-500" : "fill-none text-slate-400"}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              FALLBACK_IMAGE_BY_CATEGORY[product.category] ||
              "https://placehold.co/800x800/1e293b/ffffff?text=Product";
          }}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/product/${product.id}`}
            className="line-clamp-1 text-base font-semibold text-slate-900 hover:text-indigo-600"
          >
            {product.name}
          </Link>
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {product.rating}★
          </span>
        </div>

        <p className="text-sm text-slate-500">{product.category}</p>

        <div className="flex items-center justify-between pt-1">
          <p className="text-lg font-bold text-slate-900">${product.price}</p>
          <button
            onClick={() => addToCart(product)}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
