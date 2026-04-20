import ProductModel from "../models/productModel.js";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const CATEGORY_CATALOG = [
  {
    category: "Electronics",
    brands: [
      "Sony",
      "Samsung",
      "Apple",
      "Dell",
      "HP",
      "Lenovo",
      "ASUS",
      "Logitech",
    ],
    descriptors: ["Smart", "Ultra", "Wireless", "Pro", "Compact", "Premium"],
    productTypes: [
      "Smartphone",
      "Laptop",
      "Tablet",
      "Bluetooth Speaker",
      "Monitor",
      "Noise Cancelling Headphones",
      "Smart Watch",
    ],
    imageKeywords: [
      "smartphone",
      "laptop",
      "tablet",
      "headphones",
      "monitor",
      "smartwatch",
      "electronics",
    ],
    materials: ["aluminum", "tempered glass", "polycarbonate"],
    useCases: ["remote work", "mobile productivity", "everyday entertainment"],
    priceRange: [89, 2499],
    stockRange: [12, 180],
  },
  {
    category: "Fashion",
    brands: [
      "Nike",
      "Adidas",
      "Puma",
      "Levi's",
      "Zara",
      "Uniqlo",
      "H&M",
      "Calvin Klein",
    ],
    descriptors: [
      "Classic",
      "Modern",
      "Slim Fit",
      "Casual",
      "Urban",
      "Premium",
    ],
    productTypes: [
      "Sneakers",
      "Denim Jacket",
      "Hoodie",
      "T-Shirt",
      "Running Shorts",
      "Dress Shirt",
      "Jeans",
    ],
    imageKeywords: [
      "fashion",
      "clothing",
      "sneakers",
      "jacket",
      "hoodie",
      "shirt",
    ],
    materials: ["cotton", "denim", "recycled polyester", "leather"],
    useCases: ["daily wear", "city life", "weekend outings"],
    priceRange: [19, 399],
    stockRange: [20, 260],
  },
  {
    category: "Home",
    brands: [
      "IKEA",
      "Philips",
      "KitchenAid",
      "Dyson",
      "Nespresso",
      "Instant Pot",
      "Tefal",
      "Breville",
    ],
    descriptors: [
      "Ergonomic",
      "Minimal",
      "Energy Saving",
      "Premium",
      "Smart",
      "Modern",
    ],
    productTypes: [
      "Air Purifier",
      "Coffee Maker",
      "Desk Lamp",
      "Blender",
      "Vacuum Cleaner",
      "Electric Kettle",
      "Dining Chair",
    ],
    imageKeywords: [
      "home",
      "kitchen",
      "furniture",
      "lamp",
      "coffee",
      "appliance",
    ],
    materials: ["stainless steel", "bamboo", "glass", "solid wood"],
    useCases: ["home organization", "kitchen prep", "comfortable living"],
    priceRange: [24, 1299],
    stockRange: [10, 140],
  },
  {
    category: "Gaming",
    brands: [
      "Razer",
      "Corsair",
      "HyperX",
      "SteelSeries",
      "Logitech G",
      "MSI",
      "AOC",
      "ASUS ROG",
    ],
    descriptors: [
      "RGB",
      "Mechanical",
      "Tournament",
      "Pro",
      "Low Latency",
      "Elite",
    ],
    productTypes: [
      "Gaming Mouse",
      "Mechanical Keyboard",
      "Gaming Headset",
      "Gaming Chair",
      "Mouse Pad",
      "4K Gaming Monitor",
      "Controller",
    ],
    imageKeywords: [
      "gaming",
      "keyboard",
      "mouse",
      "headset",
      "monitor",
      "setup",
    ],
    materials: ["carbon fiber", "mesh fabric", "aircraft aluminum"],
    useCases: ["esports", "streaming", "competitive gaming"],
    priceRange: [29, 1999],
    stockRange: [8, 120],
  },
  {
    category: "Accessories",
    brands: [
      "Anker",
      "Belkin",
      "Spigen",
      "JBL",
      "Fossil",
      "Casio",
      "Ray-Ban",
      "Herschel",
    ],
    descriptors: [
      "Portable",
      "Everyday",
      "Travel",
      "Durable",
      "Minimal",
      "Essential",
    ],
    productTypes: [
      "Backpack",
      "Sunglasses",
      "Power Bank",
      "Phone Case",
      "Wallet",
      "Bluetooth Earbuds",
      "Wrist Watch",
    ],
    imageKeywords: [
      "accessories",
      "backpack",
      "sunglasses",
      "earbuds",
      "watch",
      "wallet",
    ],
    materials: ["vegan leather", "nylon", "aluminum", "polycarbonate"],
    useCases: ["daily commute", "travel", "on-the-go charging"],
    priceRange: [15, 499],
    stockRange: [18, 300],
  },
  {
    category: "Sports",
    brands: [
      "Nike",
      "Adidas",
      "Under Armour",
      "Puma",
      "Reebok",
      "New Balance",
      "Wilson",
      "Decathlon",
    ],
    descriptors: [
      "Performance",
      "Lightweight",
      "Pro",
      "Training",
      "High-Impact",
      "Breathable",
    ],
    productTypes: [
      "Running Shoes",
      "Yoga Mat",
      "Resistance Bands",
      "Gym Gloves",
      "Water Bottle",
      "Dumbbell Set",
      "Sports Jersey",
    ],
    imageKeywords: [
      "sports",
      "fitness",
      "running",
      "gym",
      "yoga",
      "workout",
      "training",
    ],
    materials: ["breathable mesh", "spandex", "rubber foam", "recycled nylon"],
    useCases: ["gym training", "outdoor running", "competitive sports"],
    priceRange: [14, 499],
    stockRange: [15, 220],
  },
];

const ALLOWED_CATEGORIES = CATEGORY_CATALOG.map((item) => item.category);

const MAX_PRODUCTS_LIMIT = 5_000_000;
const DEFAULT_PRODUCTS_COUNT = 5_000_000;
const DEFAULT_BATCH_SIZE = 10_000;
const DEFAULT_PRODUCTS_SOURCE = "synthetic";

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const createSlug = (name, sequence) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${base}-${sequence}`;
};

const CATEGORY_IMAGE_POOLS = {
  Electronics: [
    "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
  Fashion: [
    "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
  Home: [
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/6207946/pexels-photo-6207946.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
  Gaming: [
    "https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
  Accessories: [
    "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
  Sports: [
    "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
    "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  ],
};

const createProductImageUrl = (productType, sequence, category) => {
  const categoryPool = CATEGORY_IMAGE_POOLS[category] || [];
  if (categoryPool.length === 0) {
    return `https://placehold.co/800x800/1e293b/ffffff?text=${encodeURIComponent(productType)}`;
  }

  const productTypeHash = [...String(productType)].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const imageIndex = (sequence + productTypeHash) % categoryPool.length;
  return categoryPool[imageIndex];
};

const normalizeCategoryInput = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  return (
    ALLOWED_CATEGORIES.find(
      (category) => category.toLowerCase() === normalized,
    ) || null
  );
};

const buildProductDocument = (sequence, forcedCategory = null) => {
  const catalog = forcedCategory
    ? CATEGORY_CATALOG.find((item) => item.category === forcedCategory)
    : CATEGORY_CATALOG[sequence % CATEGORY_CATALOG.length];

  if (!catalog) {
    throw createHttpError(400, "Invalid category for generation");
  }

  const brand = randomItem(catalog.brands);
  const descriptor = randomItem(catalog.descriptors);
  const productType = randomItem(catalog.productTypes);
  const material = randomItem(catalog.materials);
  const useCase = randomItem(catalog.useCases);

  const suffixAlpha = String.fromCharCode(65 + (sequence % 26));
  const suffixNumber = 100 + (sequence % 900);
  const modelCode = `${suffixAlpha}${suffixNumber}`;
  const name = `${brand} ${descriptor} ${productType} ${modelCode}`;

  return {
    name,
    slug: createSlug(name, sequence),
    price: Number(
      (
        catalog.priceRange[0] +
        Math.random() * (catalog.priceRange[1] - catalog.priceRange[0])
      ).toFixed(2),
    ),
    description: `${name} features ${material} construction and is designed for ${useCase}. Built for long-term reliability, comfort, and performance in ${catalog.category.toLowerCase()} use cases.`,
    image: createProductImageUrl(productType, sequence, catalog.category),
    category: catalog.category,
    stock: randomInt(catalog.stockRange[0], catalog.stockRange[1]),
    rating: Number((3 + Math.random() * 2).toFixed(1)),
    numReviews: randomInt(5, 5000),
    isFeatured: Math.random() < 0.08,
    isDeleted: false,
  };
};

export const generateProducts = async (req, res, next) => {
  try {
    const requestedCount = Number(
      req.body?.count ?? req.query?.count ?? DEFAULT_PRODUCTS_COUNT,
    );
    const requestedBatchSize = Number(
      req.body?.batchSize ?? req.query?.batchSize ?? DEFAULT_BATCH_SIZE,
    );
    const clearExisting =
      parseBoolean(req.body?.clearExisting) ||
      parseBoolean(req.query?.clearExisting);
    const requestedCategory =
      req.body?.category ?? req.query?.category ?? req.body?.Category;

    const category = requestedCategory
      ? normalizeCategoryInput(requestedCategory)
      : null;

    if (requestedCategory && !category) {
      throw createHttpError(
        400,
        `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      );
    }

    const totalCount = Number.isFinite(requestedCount)
      ? Math.min(Math.max(Math.floor(requestedCount), 1), MAX_PRODUCTS_LIMIT)
      : DEFAULT_PRODUCTS_COUNT;

    const batchSize = Number.isFinite(requestedBatchSize)
      ? Math.min(Math.max(Math.floor(requestedBatchSize), 500), 50_000)
      : DEFAULT_BATCH_SIZE;

    if (clearExisting) {
      console.log("[generateProducts] Clearing existing products...");
      await ProductModel.deleteMany({});
      console.log("[generateProducts] Existing products cleared.");
    }

    const startedAt = Date.now();
    const totalBatches = Math.ceil(totalCount / batchSize);
    console.log(
      `[generateProducts] Start | target=${totalCount.toLocaleString()} batchSize=${batchSize.toLocaleString()} batches=${totalBatches.toLocaleString()} category=${category || "All"}`,
    );

    let insertedCount = 0;
    for (let start = 0; start < totalCount; start += batchSize) {
      const batchNumber = Math.floor(start / batchSize) + 1;
      const currentBatchSize = Math.min(batchSize, totalCount - start);
      const batch = Array.from({ length: currentBatchSize }, (_, index) =>
        buildProductDocument(start + index + 1, category),
      );

      await ProductModel.insertMany(batch, { ordered: false });
      insertedCount += currentBatchSize;

      const progressPercent = ((insertedCount / totalCount) * 100).toFixed(2);
      const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(
        `[generateProducts] Progress ${progressPercent}% | batch ${batchNumber}/${totalBatches} | inserted=${insertedCount.toLocaleString()} | elapsed=${elapsedSeconds}s`,
      );
    }

    const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `[generateProducts] Completed | inserted=${insertedCount.toLocaleString()} | duration=${totalSeconds}s`,
    );

    return res.status(201).json({
      message: `Successfully generated ${insertedCount.toLocaleString()} products.`,
      insertedCount,
      batchSize,
      clearExisting,
      category: category || "All",
      source: DEFAULT_PRODUCTS_SOURCE,
    });
  } catch (error) {
    return next(error);
  }
};

const parseBoolean = (value) =>
  value === true || value === "true" || value === "1";

const sanitizeText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const inferCategoryFromRealProduct = (entry) => {
  const text = sanitizeText(
    `${entry?.categories || ""} ${entry?.product_name || ""} ${entry?.generic_name || ""}`,
  ).toLowerCase();

  if (/gaming|game|xbox|playstation|nintendo|controller/.test(text)) {
    return "Gaming";
  }

  if (
    /phone|laptop|tablet|monitor|camera|electronic|headphone|earphone|charger|usb/.test(
      text,
    )
  ) {
    return "Electronics";
  }

  if (/fashion|shirt|dress|jeans|sneaker|shoe|hoodie|jacket/.test(text)) {
    return "Fashion";
  }

  if (/watch|wallet|bag|backpack|sunglass|accessory|belt|case/.test(text)) {
    return "Accessories";
  }

  if (
    /sport|fitness|gym|running|yoga|workout|dumbbell|jersey|athletic|exercise/.test(
      text,
    )
  ) {
    return "Sports";
  }

  return "Home";
};

const priceRangeByCategory = {
  Electronics: [39, 1799],
  Fashion: [12, 349],
  Home: [4, 299],
  Gaming: [19, 899],
  Accessories: [8, 259],
  Sports: [14, 499],
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      isFeatured,
      sort,
      sortBy,
    } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isFinite(pageNumber) ||
      !Number.isInteger(pageNumber) ||
      pageNumber < 1
    ) {
      throw createHttpError(400, "page must be an integer >= 1");
    }

    if (
      !Number.isFinite(limitNumber) ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 200
    ) {
      throw createHttpError(400, "limit must be an integer between 1 and 200");
    }

    const skip = (pageNumber - 1) * limitNumber;
    const filter = { isDeleted: false };
    const sortQuery = {};
    if (search) {
      filter.slug = { $regex: `^${escapeRegex(search)}`, $options: "i" };
    }
    if (isFeatured) {
      filter.isFeatured = isFeatured === "true";
    }
    if (sortBy) {
      sortQuery[sortBy] = sort === "desc" ? -1 : 1;
    }
    const products = await ProductModel.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);
    const totalProducts = await ProductModel.countDocuments(filter);
    return res.status(200).json({
      message: "success",

      products: products,
      totalProducts: totalProducts,

      page: pageNumber,
      limit: limitNumber,
      skip,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!/^[a-f\d]{24}$/i.test(productId)) {
      throw createHttpError(400, "Invalid product id");
    }

    const product = await ProductModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    return res.status(200).json({
      message: "success",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { price, stock } = req.body;
    const product = await ProductModel.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");
    price !== undefined ? (product.price = price) : product.price;
    stock !== undefined ? (product.stock = stock) : product.stock;
    await product.save();
    return res.status(200).json({
      message: "success",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;
    // const { isDeleted } = req.body;
    const product = await ProductModel.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");
    product.isDeleted = true;
    await product.save();
    return res.status(200).json({
      message: "success",
    });
  } catch (error) {
    return next(error);
  }
};
