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

const createProductImageUrl = (productType, sequence, category) => {
  const seed = encodeURIComponent(`${category}-${productType}-${sequence}`);
  return `https://picsum.photos/seed/${seed}/800/800`;
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

const PRODUCT_WORD_BANK = {
  brands: [
    "NovaTech",
    "UrbanNest",
    "PeakForge",
    "LunaCraft",
    "AeroWave",
    "TerraPulse",
    "VividCore",
    "PrimeOak",
    "NimbusLab",
    "VoltEdge",
  ],
  adjectives: [
    "Smart",
    "Premium",
    "Eco",
    "Compact",
    "Wireless",
    "Ultra",
    "Classic",
    "Modern",
    "Portable",
    "Professional",
    "Essential",
    "Advanced",
  ],
  categories: [
    "Headphones",
    "Backpack",
    "Sneakers",
    "Desk Lamp",
    "Coffee Maker",
    "Gaming Mouse",
    "Yoga Mat",
    "Water Bottle",
    "Jacket",
    "Smart Watch",
    "Keyboard",
    "Bluetooth Speaker",
  ],
  variants: [
    "Series",
    "Edition",
    "Plus",
    "Pro",
    "Max",
    "Lite",
    "Flex",
    "Prime",
    "Go",
    "Core",
  ],
  materials: [
    "aluminum",
    "recycled fabric",
    "carbon fiber",
    "soft-touch polymer",
    "stainless steel",
    "vegan leather",
    "bamboo fiber",
    "tempered glass",
  ],
  useCases: [
    "daily commute",
    "home office",
    "outdoor adventures",
    "travel",
    "fitness training",
    "professional setup",
    "student life",
    "hybrid work",
  ],
};

// export const generateProducts = async (req, res, next) => {
//   try {
//     const requestedCount = Number(
//       req.body?.count ?? req.query?.count ?? DEFAULT_PRODUCTS_COUNT,
//     );
//     const requestedBatchSize = Number(
//       req.body?.batchSize ?? req.query?.batchSize ?? DEFAULT_BATCH_SIZE,
//     );
//     const clearExisting =
//       req.body?.clearExisting === true ||
//       req.query?.clearExisting === "true" ||
//       req.query?.clearExisting === "1";

//     const totalCount = Number.isFinite(requestedCount)
//       ? Math.min(Math.max(Math.floor(requestedCount), 1), MAX_PRODUCTS_LIMIT)
//       : DEFAULT_PRODUCTS_COUNT;

//     const batchSize = Number.isFinite(requestedBatchSize)
//       ? Math.min(Math.max(Math.floor(requestedBatchSize), 500), 50_000)
//       : DEFAULT_BATCH_SIZE;

//     if (clearExisting) {
//       console.log("[generateProducts] Clearing existing products...");
//       await ProductModel.deleteMany({});
//       console.log("[generateProducts] Existing products cleared.");
//     }

//     const startedAt = Date.now();
//     const totalBatches = Math.ceil(totalCount / batchSize);
//     console.log(
//       `[generateProducts] Start | target=${totalCount.toLocaleString()} batchSize=${batchSize.toLocaleString()} batches=${totalBatches.toLocaleString()}`,
//     );

//     let insertedCount = 0;
//     for (let start = 0; start < totalCount; start += batchSize) {
//       const batchNumber = Math.floor(start / batchSize) + 1;
//       const currentBatchSize = Math.min(batchSize, totalCount - start);
//       const batch = Array.from({ length: currentBatchSize }, (_, index) =>
//         buildProductDocument(start + index + 1),
//       );

//       await ProductModel.insertMany(batch, { ordered: false });
//       insertedCount += currentBatchSize;

//       const progressPercent = ((insertedCount / totalCount) * 100).toFixed(2);
//       const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
//       console.log(
//         `[generateProducts] Progress ${progressPercent}% | batch ${batchNumber}/${totalBatches} | inserted=${insertedCount.toLocaleString()} | elapsed=${elapsedSeconds}s`,
//       );
//     }

//     const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
//     console.log(
//       `[generateProducts] Completed | inserted=${insertedCount.toLocaleString()} | duration=${totalSeconds}s`,
//     );

//     return res.status(201).json({
//       message: `Successfully generated ${insertedCount.toLocaleString()} products.`,
//       insertedCount,
//       batchSize,
//       clearExisting,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

const parseBoolean = (value) =>
  value === true || value === "true" || value === "1";

const sanitizeText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const createSlugFromName = (name) =>
  sanitizeText(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

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
      category,
      isFeatured,
      sort,
      sortBy,
      minPrice,
      maxPrice,
      minRating,
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
      const term = String(search).trim();
      if (term) {
        filter.$or = [
          { name: { $regex: escapeRegex(term), $options: "i" } },
          { slug: { $regex: escapeRegex(term), $options: "i" } },
        ];
      }
    }

    if (category) {
      const normalizedCategory = normalizeCategoryInput(category);
      if (!normalizedCategory) {
        throw createHttpError(
          400,
          `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        );
      }
      filter.category = normalizedCategory;
    }

    if (isFeatured) {
      filter.isFeatured = isFeatured === "true";
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        const min = Number(minPrice);
        if (Number.isFinite(min) && min >= 0) {
          filter.price.$gte = min;
        }
      }
      if (maxPrice !== undefined) {
        const max = Number(maxPrice);
        if (Number.isFinite(max) && max >= 0) {
          filter.price.$lte = max;
        }
      }
    }

    // Rating filter
    if (minRating !== undefined) {
      const rating = Number(minRating);
      if (Number.isFinite(rating) && rating >= 0 && rating <= 5) {
        filter.rating = { $gte: rating };
      }
    }

    if (sortBy) {
      if (sortBy === "featured") {
        sortQuery.isFeatured = -1;
        sortQuery.createdAt = -1;
      } else if (sortBy === "popular") {
        sortQuery.numReviews = -1;
        sortQuery.rating = -1;
      } else if (sortBy === "rating") {
        sortQuery.rating = -1;
        sortQuery.numReviews = -1;
      } else {
        sortQuery[sortBy] = sort === "desc" ? -1 : 1;
      }
    }

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

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

export const getDeletedProduct = async (req, res, next) => {
  try {
    const deletedProducts = await ProductModel.find({ isDeleted: true });
    if (!deleteProducts) throw createHttpError(400, "No deleleted product");
    return res.status(200).json({
      message: "success",
      data: deletedProducts,
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
    const { name, category, description, price, stock } = req.body;

    if (!/^[a-f\d]{24}$/i.test(productId)) {
      throw createHttpError(400, "Invalid product id");
    }

    const product = await ProductModel.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");

    if (name !== undefined) {
      const sanitizedName = sanitizeText(name);
      if (!sanitizedName) {
        throw createHttpError(400, "name is required");
      }
      product.name = sanitizedName;
      product.slug = createSlugFromName(sanitizedName);
    }

    if (category !== undefined) {
      const normalizedCategory = normalizeCategoryInput(category);
      if (!normalizedCategory) {
        throw createHttpError(
          400,
          `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        );
      }
      product.category = normalizedCategory;
    }

    if (description !== undefined) {
      const sanitizedDescription = sanitizeText(description);
      if (!sanitizedDescription) {
        throw createHttpError(400, "description is required");
      }
      product.description = sanitizedDescription;
    }

    if (price !== undefined) {
      const normalizedPrice = Number(price);
      if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
        throw createHttpError(400, "price must be a number >= 0");
      }
      product.price = normalizedPrice;
    }

    if (stock !== undefined) {
      const normalizedStock = Number(stock);
      if (
        !Number.isFinite(normalizedStock) ||
        !Number.isInteger(normalizedStock) ||
        normalizedStock < 0
      ) {
        throw createHttpError(400, "stock must be an integer >= 0");
      }
      product.stock = normalizedStock;
    }

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

export const addProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      description,
      image,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    const sanitizedName = sanitizeText(name);
    if (!sanitizedName) {
      throw createHttpError(400, "name is required");
    }

    const normalizedCategory = normalizeCategoryInput(category);
    if (!normalizedCategory) {
      throw createHttpError(
        400,
        `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      );
    }

    const sanitizedDescription = sanitizeText(description);
    if (!sanitizedDescription) {
      throw createHttpError(400, "description is required");
    }

    const normalizedPrice = Number(price);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw createHttpError(400, "price must be a number >= 0");
    }

    const normalizedStock = Number(stock);
    if (
      !Number.isFinite(normalizedStock) ||
      !Number.isInteger(normalizedStock) ||
      normalizedStock < 0
    ) {
      throw createHttpError(400, "stock must be an integer >= 0");
    }

    const normalizedRating =
      rating === undefined || rating === null || rating === ""
        ? 0
        : Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 0 ||
      normalizedRating > 5
    ) {
      throw createHttpError(400, "rating must be a number between 0 and 5");
    }

    const normalizedNumReviews =
      numReviews === undefined || numReviews === null || numReviews === ""
        ? 0
        : Number(numReviews);
    if (
      !Number.isFinite(normalizedNumReviews) ||
      !Number.isInteger(normalizedNumReviews) ||
      normalizedNumReviews < 0
    ) {
      throw createHttpError(400, "numReviews must be an integer >= 0");
    }

    const sanitizedImage = sanitizeText(image);
    const newProduct = await ProductModel.create({
      name: sanitizedName,
      slug: createSlugFromName(sanitizedName),
      category: normalizedCategory,
      price: normalizedPrice,
      stock: normalizedStock,
      description: sanitizedDescription,
      image:
        sanitizedImage ||
        createProductImageUrl(sanitizedName, Date.now(), normalizedCategory),
      rating: normalizedRating,
      numReviews: normalizedNumReviews,
      isFeatured: Boolean(isFeatured),
      isDeleted: false,
    });
    return res.status(201).json({
      message: "success",
      data: newProduct,
    });
  } catch (error) {
    return next(error);
  }
};
