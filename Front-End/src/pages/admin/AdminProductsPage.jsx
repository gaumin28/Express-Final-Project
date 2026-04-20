import { useEffect, useState } from "react";
import { getProductsPage } from "../../services/api";

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const pageWindowStart = Math.max(1, page - 2);
  const pageWindowEnd = Math.min(totalPages, page + 2);
  const visiblePages = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index,
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      clearTimeout(timerId);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    getProductsPage({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy: "createdAt",
      sort: "desc",
    })
      .then((result) => {
        if (!cancelled) {
          setProducts(result.products);
          setTotalProducts(result.totalProducts);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalProducts(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  function handleDelete(id) {
    if (confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function handleEdit(product) {
    setEditProduct(product);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditProduct(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading products..."
              : `${totalProducts.toLocaleString()} total products`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          + Add product
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setLoading(true);
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-xs"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {[
                "Product",
                "Category",
                "Price",
                "Stock",
                "Rating",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <span className="font-medium text-slate-900 max-w-40 truncate">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  ${product.price}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock <= 10 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-amber-600 font-semibold">
                  {product.rating}★
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <p className="text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
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

          {pageWindowStart > 1 && (
            <>
              <button
                onClick={() => {
                  setLoading(true);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700"
              >
                1
              </button>
              {pageWindowStart > 2 && (
                <span className="px-1 text-slate-400">…</span>
              )}
            </>
          )}

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => {
                if (pageNumber === page) return;
                setLoading(true);
                setPage(pageNumber);
              }}
              disabled={pageNumber === page}
              className={`rounded-lg border px-3 py-1.5 font-semibold ${
                pageNumber === page
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 text-slate-700"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          {pageWindowEnd < totalPages && (
            <>
              {pageWindowEnd < totalPages - 1 && (
                <span className="px-1 text-slate-400">…</span>
              )}
              <button
                onClick={() => {
                  setLoading(true);
                  setPage(totalPages);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700"
              >
                {totalPages}
              </button>
            </>
          )}

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

      {/* Add / Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleCloseForm}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editProduct ? "Edit product" : "Add product"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCloseForm();
              }}
            >
              {[
                {
                  label: "Product name",
                  defaultValue: editProduct?.name,
                  placeholder: "e.g. Wireless Keyboard",
                },
                {
                  label: "Category",
                  defaultValue: editProduct?.category,
                  placeholder: "e.g. Electronics",
                },
                {
                  label: "Price ($)",
                  defaultValue: editProduct?.price,
                  placeholder: "0.00",
                },
                {
                  label: "Stock",
                  defaultValue: editProduct?.stock,
                  placeholder: "0",
                },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    defaultValue={field.defaultValue}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  defaultValue={editProduct?.description}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {editProduct ? "Save changes" : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
