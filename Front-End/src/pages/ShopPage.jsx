import { useEffect, useState } from "react";
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
];

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const PAGE_SIZE = 24;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const sortQuery =
      sort === "price-asc"
        ? { sortBy: "price", sort: "asc" }
        : sort === "price-desc"
          ? { sortBy: "price", sort: "desc" }
          : sort === "rating"
            ? { sortBy: "rating", sort: "desc" }
            : { isFeatured: true, sortBy: "createdAt", sort: "desc" };

    getProductsPage({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
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
  }, [page, sort, debouncedSearch]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Shop</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading products…"
                : `${totalProducts.toLocaleString()} products`}
            </p>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => {
              setPage(1);
            }}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99] flex gap-2"
          >
            <img src={searchIcon} alt="search-icon" /> <span>Search</span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
