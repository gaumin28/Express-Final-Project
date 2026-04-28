import { useEffect, useState } from "react";
import {
  addProduct,
  getProductsPage,
  updateProduct,
  deleteProduct,
} from "../../services/api";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
};

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Gaming",
  "Accessories",
  "Sports",
];

const productCategories = categories.filter((category) => category !== "All");

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSelected, setIsSelected] = useState("All");

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const pageWindowStart = Math.max(1, page - 2);
  const pageWindowEnd = Math.min(totalPages, page + 2);
  const visiblePages = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index,
  );

  const handleSearch = () => {
    setLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
  };

  useEffect(() => {
    let cancelled = false;

    getProductsPage({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      category: isSelected !== "All" ? isSelected : undefined,
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
  }, [page, search, isSelected]);

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;

    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteProduct(id);
      setTotalProducts((n) => Math.max(0, n - 1));
    } catch (error) {
      setProducts(previous);
      alert(error.message || "Failed to delete product. Please try again.");
    }
  }

  function handleEdit(product) {
    setEditProduct(product);
    setFormData({
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price ?? "",
      stock: product?.stock ?? "",
      description: product?.description || "",
      image: product?.image || "",
    });
    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setSaving(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        image: formData.image,
      };

      if (editProduct?.id) {
        const updatedProduct = await updateProduct(editProduct.id, payload);

        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        );
      } else {
        const createdProduct = await addProduct(payload);
        setProducts((prev) => [createdProduct, ...prev]);
        setTotalProducts((n) => n + 1);
      }

      handleCloseForm();
    } catch (error) {
      setFormError(error.message || "Failed to save product changes.");
      setSaving(false);
    }
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
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                isSelected === category
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              onClick={() => {
                setLoading(true);
                setIsSelected(category);
                setPage(1);
              }}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setFormData(EMPTY_FORM);
            setFormError("");
            setShowForm(true);
          }}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          + Add product
        </button>
      </div>

      {/* Search */}
      <div className="flex w-full gap-3 sm:max-w-xs">
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
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          onClick={handleSearch}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              {[
                {
                  key: "name",
                  label: "Product name",
                  placeholder: "e.g. Wireless Keyboard",
                },
                {
                  key: "price",
                  label: "Price ($)",
                  placeholder: "0.00",
                },
                {
                  key: "stock",
                  label: "Stock",
                  placeholder: "0",
                },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80?text=Invalid+Image";
                      }}
                    />
                  </div>
                )}
              </div>
              {formError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {saving
                    ? "Saving..."
                    : editProduct
                      ? "Save changes"
                      : "Add product"}
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
