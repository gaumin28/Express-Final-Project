import ProductModel from "../models/productModel.js";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const MAX_PRODUCTS_LIMIT = 5_000_000;
const DEFAULT_PRODUCTS_COUNT = 5_000_000;
const DEFAULT_BATCH_SIZE = 10_000;

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const createSlug = (name, sequence) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${base}-${sequence}`;
};

const buildProductDocument = (sequence) => {
  const brand = randomItem(PRODUCT_WORD_BANK.brands);
  const adjective = randomItem(PRODUCT_WORD_BANK.adjectives);
  const category = randomItem(PRODUCT_WORD_BANK.categories);
  const variant = randomItem(PRODUCT_WORD_BANK.variants);
  const material = randomItem(PRODUCT_WORD_BANK.materials);
  const useCase = randomItem(PRODUCT_WORD_BANK.useCases);
  const modelNumber = String(1000 + (sequence % 9000));

  const name = `${brand} ${adjective} ${category} ${variant} ${modelNumber}`;

  return {
    name,
    slug: createSlug(name, sequence),
    price: Number((9.99 + Math.random() * 990).toFixed(2)),
    description: `${name} is crafted from ${material} and designed for ${useCase}. It offers reliable performance and modern style for everyday use.`,
    image: `https://picsum.photos/seed/product-${sequence}/800/800`,
    stock: Math.floor(Math.random() * 301),
    rating: Number((3 + Math.random() * 2).toFixed(1)),
    numReviews: Math.floor(Math.random() * 5000),
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
      req.body?.clearExisting === true ||
      req.query?.clearExisting === "true" ||
      req.query?.clearExisting === "1";

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
      `[generateProducts] Start | target=${totalCount.toLocaleString()} batchSize=${batchSize.toLocaleString()} batches=${totalBatches.toLocaleString()}`,
    );

    let insertedCount = 0;
    for (let start = 0; start < totalCount; start += batchSize) {
      const batchNumber = Math.floor(start / batchSize) + 1;
      const currentBatchSize = Math.min(batchSize, totalCount - start);
      const batch = Array.from({ length: currentBatchSize }, (_, index) =>
        buildProductDocument(start + index + 1),
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
    });
  } catch (error) {
    return next(error);
  }
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
