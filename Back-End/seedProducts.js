import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductModel from "./models/productModel.js";

dotenv.config();

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Gaming",
  "Accessories",
  "Sports",
];

const CATEGORY_DATA = {
  Electronics: {
    products: [
      "Smartphone",
      "Laptop",
      "Tablet",
      "Headphones",
      "Monitor",
      "Smartwatch",
      "Wireless Mouse",
      "Keyboard",
      "Webcam",
      "Speaker",
    ],
    priceRange: [50, 2500],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
    ],
  },
  Fashion: {
    products: [
      "Sneakers",
      "Jacket",
      "Hoodie",
      "T-Shirt",
      "Jeans",
      "Dress",
      "Shorts",
      "Sweater",
      "Coat",
      "Shirt",
    ],
    priceRange: [15, 400],
    images: [
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=800&fit=crop",
    ],
  },
  Home: {
    products: [
      "Coffee Maker",
      "Vacuum Cleaner",
      "Air Purifier",
      "Lamp",
      "Blender",
      "Toaster",
      "Cookware Set",
      "Bedding Set",
      "Curtains",
      "Rug",
    ],
    priceRange: [20, 800],
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585128903994-0f838e192503?w=800&h=800&fit=crop",
    ],
  },
  Gaming: {
    products: [
      "Gaming Console",
      "Controller",
      "Gaming Chair",
      "VR Headset",
      "Gaming Keyboard",
      "Gaming Mouse",
      "Headset",
      "Monitor",
      "Capture Card",
      "Racing Wheel",
    ],
    priceRange: [30, 1500],
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop",
    ],
  },
  Accessories: {
    products: [
      "Watch",
      "Sunglasses",
      "Backpack",
      "Wallet",
      "Belt",
      "Hat",
      "Scarf",
      "Jewelry",
      "Phone Case",
      "Handbag",
    ],
    priceRange: [10, 500],
    images: [
      "https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585123388888-c8ef59af484e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&h=800&fit=crop",
    ],
  },
  Sports: {
    products: [
      "Yoga Mat",
      "Dumbbells",
      "Running Shoes",
      "Resistance Bands",
      "Bicycle",
      "Tennis Racket",
      "Basketball",
      "Soccer Ball",
      "Fitness Tracker",
      "Water Bottle",
    ],
    priceRange: [10, 1000],
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=800&fit=crop",
    ],
  },
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateProduct() {
  const category = faker.helpers.arrayElement(CATEGORIES);
  const categoryData = CATEGORY_DATA[category];
  const productType = faker.helpers.arrayElement(categoryData.products);
  const brand = faker.company.name();
  const adjective = faker.helpers.arrayElement([
    "Premium",
    "Pro",
    "Ultra",
    "Smart",
    "Advanced",
    "Classic",
    "Modern",
    "Elite",
    "Deluxe",
    "Essential",
  ]);

  const name = `${adjective} ${brand} ${productType}`;
  const [minPrice, maxPrice] = categoryData.priceRange;
  const price = parseFloat(
    faker.number.float({ min: minPrice, max: maxPrice }).toFixed(2),
  );

  return {
    name: name.substring(0, 100),
    slug: generateSlug(name),
    price,
    description: faker.commerce.productDescription().substring(0, 1000),
    image: faker.helpers.arrayElement(categoryData.images),
    category,
    stock: faker.number.int({ min: 0, max: 500 }),
    rating: parseFloat(faker.number.float({ min: 3.5, max: 5 }).toFixed(1)),
    numReviews: faker.number.int({ min: 0, max: 1000 }),
    isFeatured: faker.datatype.boolean(0.1), // 10% chance of being featured
    isDeleted: false,
  };
}

async function seedProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB");

    // Ask user if they want to delete existing products
    console.log("\nClearing existing products...");
    const deleteResult = await ProductModel.deleteMany({});
    console.log(
      `Deleted ${deleteResult.deletedCount.toLocaleString()} existing products`,
    );

    // Number of products to generate
    const TOTAL_PRODUCTS = 3000000; // Change this number as needed
    const BATCH_SIZE = 10000;
    const totalBatches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);

    console.log(
      `\nGenerating ${TOTAL_PRODUCTS.toLocaleString()} new products in ${totalBatches} batches...`,
    );

    let totalCreated = 0;

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchProducts = [];
      const productsInThisBatch = Math.min(
        BATCH_SIZE,
        TOTAL_PRODUCTS - totalCreated,
      );

      for (let i = 0; i < productsInThisBatch; i++) {
        batchProducts.push(generateProduct());
      }

      await ProductModel.insertMany(batchProducts, { ordered: false });
      totalCreated += productsInThisBatch;

      const progress = ((totalCreated / TOTAL_PRODUCTS) * 100).toFixed(1);
      console.log(
        `Batch ${batch + 1}/${totalBatches} completed - Created ${totalCreated.toLocaleString()}/${TOTAL_PRODUCTS.toLocaleString()} products (${progress}%)`,
      );
    }

    console.log(
      `\n✅ Successfully created ${totalCreated.toLocaleString()} products!`,
    );

    // Show some stats
    const stats = await ProductModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nProducts by category:");
    stats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count.toLocaleString()}`);
    });
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

seedProducts();
