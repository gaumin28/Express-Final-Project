import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import { getProductsPage } from "../services/api";
import searchIcon from "../image/search-icon.png";

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="h-52 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-slate-200 rounded w-16" />
          <div className="h-8 bg-slate-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

function ShopPage() {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 24;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const handleSearch = () => {
    setLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
  };

  const applyFilters = () => {
    setLoading(true);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;

    const sortQuery =
      sort === "price-asc"
        ? { sortBy: "price", sort: "asc" }
        : sort === "price-desc"
          ? { sortBy: "price", sort: "desc" }
          : sort === "rating"
            ? { sortBy: "rating", sort: "desc" }
            : sort === "popular"
              ? { sortBy: "popular", sort: "desc" }
              : { sortBy: "featured", sort: "desc" };

    getProductsPage({
      page,
      limit: PAGE_SIZE,
      search,
      category: selectedCategory || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: minRating > 0 ? minRating : undefined,
      ...sortQuery,
    })
      .then((result) => {
        if (!cancelled) {
          setProducts(result.products);
          setTotalProducts(result.totalProducts);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalProducts(0);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, sort, search, selectedCategory, priceRange, minRating]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Shop {selectedCategory ? `- ${selectedCategory}` : ""}
            </h1>
            {/* <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading products…"
                : `${totalProducts.toLocaleString()} products`}
            </p> */}
          </div>

          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => {
                setLoading(true);
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99] flex gap-2"
          >
            <img src={searchIcon} alt="search-icon" /> <span>Search</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            {/* Price Range Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Price Range
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  min="0"
                  max={priceRange[1]}
                  placeholder="Min"
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  min={priceRange[0]}
                  max="10000"
                  placeholder="Max"
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={applyFilters}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      setMinRating(rating);
                      applyFilters();
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      minRating === rating
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {rating === 0 ? "All" : `${rating}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setPriceRange([0, 5000]);
                setMinRating(0);
                applyFilters();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-y-4 justify-around sm:justify-around lg:justify-between">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <p className="text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShopPage;
