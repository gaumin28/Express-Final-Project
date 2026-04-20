import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import { getProducts } from "../services/api";
import ps5 from "../image/ps5.jpg";
import adidas from "../image/adidas-sneakers.webp";
import Apple from "../image/Apple-iPhone-17.jpg";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Gaming",
  "Accessories",
  "Sports",
];
const images = [ps5, adidas, Apple];

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((items) => {
        if (!cancelled) {
          setProducts(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="space-y-12">
      <section
        className="group relative overflow-hidden rounded-3xl bg-center bg-contain px-6 py-16 text-white shadow-lg sm:px-10"
        style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
      >
        <button
          onClick={handlePrevImage}
          aria-label="Previous image"
          className="absolute top-1/2 left-0 z-20 flex h-12 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-full bg-black/30 text-white shadow-lg transition-all duration-300 hover:bg-black/70"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="ml-0.5 size-6"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="48"
              d="M328 112 184 256l144 144"
            ></path>
          </svg>
        </button>
        <button
          onClick={handleNextImage}
          aria-label="Next image"
          className="absolute top-1/2 right-0 z-20 flex h-12 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-full bg-black/30 text-white shadow-lg transition-all duration-300 hover:bg-black/70"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="ml-1.5 size-6"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="48"
              d="m184 112 144 144-144 144"
            ></path>
          </svg>
        </button>
        <div className="max-w-2xl space-y-5">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            New season launch
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            Discover products you will love.
          </h1>
          <p className="text-sm text-indigo-100 sm:text-base">
            Shop trending products, discover great deals, and enjoy a smooth
            checkout experience—all in one modern eShop built for everyday
            shopping.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/shop"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Explore shop
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Browse categories
          </h2>
          <Link
            to="/shop"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Featured products
          </h2>
          <Link
            to="/shop"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            See collection
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
