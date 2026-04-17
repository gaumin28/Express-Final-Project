import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import ProductCard from "../components/products/ProductCard";

function WishlistPage() {
  const { wishlistItems } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="rounded-full bg-slate-100 p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Save items you love by clicking the ♡ on any product.
          </p>
        </div>
        <Link
          to="/shop"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Wishlist{" "}
          <span className="text-slate-400">({wishlistItems.length})</span>
        </h1>
        <Link
          to="/shop"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
