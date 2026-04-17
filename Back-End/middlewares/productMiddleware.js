const MAX_PRODUCTS_LIMIT = 5_000_000;
const MIN_BATCH_SIZE = 500;
const MAX_BATCH_SIZE = 50_000;

const hasValue = (v) => v !== undefined && v !== null && v !== "";

const toNumber = (value) => Number(value);

export const validateGenerateProductsPayload = (req, res, next) => {
  const rawCount = req.body?.count ?? req.query?.count;
  const rawBatchSize = req.body?.batchSize ?? req.query?.batchSize;
  const rawClearExisting = req.body?.clearExisting ?? req.query?.clearExisting;

  if (hasValue(rawCount)) {
    const count = toNumber(rawCount);
    if (!Number.isFinite(count) || !Number.isInteger(count)) {
      return res.status(400).json({ error: "count must be an integer" });
    }

    if (count < 1 || count > MAX_PRODUCTS_LIMIT) {
      return res.status(400).json({
        error: `count must be between 1 and ${MAX_PRODUCTS_LIMIT.toLocaleString()}`,
      });
    }
  }

  if (hasValue(rawBatchSize)) {
    const batchSize = toNumber(rawBatchSize);
    if (!Number.isFinite(batchSize) || !Number.isInteger(batchSize)) {
      return res.status(400).json({ error: "batchSize must be an integer" });
    }

    if (batchSize < MIN_BATCH_SIZE || batchSize > MAX_BATCH_SIZE) {
      return res.status(400).json({
        error: `batchSize must be between ${MIN_BATCH_SIZE.toLocaleString()} and ${MAX_BATCH_SIZE.toLocaleString()}`,
      });
    }
  }

  if (hasValue(rawClearExisting)) {
    const normalized = String(rawClearExisting).toLowerCase();
    const validValues = ["true", "false", "1", "0"];
    if (!validValues.includes(normalized)) {
      return res.status(400).json({
        error: "clearExisting must be true, false, 1, or 0",
      });
    }
  }

  next();
};
