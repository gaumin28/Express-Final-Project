import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import { getProductsPage } from "../services/api";
import ps5 from "../image/ps5.jpg";
import adidas from "../image/adidas-sneakers.webp";
import Apple from "../image/Apple-iPhone-17.jpg";
import sport from "../assets/sport.jpg";
import clothing from "../assets/clothing.jpg";
import furniture from "../assets/furniture.jpg";
import gaming from "../assets/gaming.jpg";
import laptop from "../assets/laptop.webp";
import accessory from "../assets/accessory.avif";
import { useAuth } from "../context/useAuth";

const categories = [
  "All",
  { name: "Electronics", img: laptop },
  { name: "Fashion", img: clothing },
  { name: "Home", img: furniture },
  { name: "Gaming", img: gaming },
  { name: "Accessories", img: accessory },
  { name: "Sports", img: sport },
];
const images = [ps5, adidas, Apple];

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    getProductsPage({
      page: 1,
      limit: 12,
      sortBy: "featured",
      sort: "desc",
    })
      .then((result) => {
        if (!cancelled) {
          setProducts(result.products);
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
            {!user && (
              <Link
                to="/register"
                className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Categories
          </h2>
          {/* <Link
            to="/shop"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
          </Link> */}
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.toSpliced(0, 1).map((category, index) => (
            <Link
              key={index}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="flex flex-col h-40 w-30 p-5 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              <img
                className="h-20 rounded"
                src={category.img}
                alt={category.name}
              />
              {category.name}
            </Link>
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

        <div className="flex gap-y-4 gap-2 flex-wrap justify-between sm:justify-around">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
