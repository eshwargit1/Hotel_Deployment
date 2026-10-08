require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Dynamic CORS configuration (supports localhost + deployed frontend)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins === "*" ? true : allowedOrigins,
    credentials: true,
  })
);

// Serverless / Local storage check
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDirectory = path.join(__dirname, "uploads");

if (!isServerless) {
  try {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    app.use("/uploads", express.static(uploadDirectory));
  } catch (err) {
    console.warn("Could not create local uploads folder:", err.message);
  }
}

// Multer storage: Memory storage for serverless/cloud, Disk storage for local development
const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: uploadDirectory,
      filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path
          .basename(file.originalname, extension)
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-|-$/g, "")
          .toLowerCase();
        callback(null, `${Date.now()}-${baseName || "hotel-image"}${extension}`);
      },
    });

const upload = multer({
  storage,
  limits: { files: 10, fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

// Helper function to extract image URL (Base64 data URI in serverless / relative path in local)
const getUploadedImagePath = (file) => {
  if (!file) return null;
  if (file.buffer) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  return null;
};

// PostgreSQL / Supabase Pool configuration
const isRemoteDb = Boolean(
  process.env.DATABASE_URL ||
    (process.env.PGHOST &&
      process.env.PGHOST !== "localhost" &&
      process.env.PGHOST !== "127.0.0.1")
);

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.PGUSER || "postgres",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "hotel_management",
      password: process.env.PGPASSWORD || "eshwar123",
      port: Number(process.env.PGPORT || 5432),
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.connect()
  .then((client) => {
    console.log("PostgreSQL / Supabase connected successfully");
    client.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Hotel Management API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/hotels", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotel_details ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({
      error: "Database error",
      details: error.message,
    });
  }
});

app.post("/hotels", upload.array("images", 10), async (req, res) => {
  const { hotelName, location, price, rating, description, latitude, longitude, image_url, src } = req.body;
  const files = req.files || [];

  let imagePath = null;
  if (files.length > 0) {
    imagePath = getUploadedImagePath(files[0]);
  } else if (image_url || src) {
    imagePath = image_url || src;
  }

  if (!hotelName || !location || !price || !description || !latitude || !longitude || !imagePath) {
    if (!isServerless && files.length) {
      files.forEach((file) => file.path && fs.unlink(file.path, () => {}));
    }
    return res.status(400).json({ error: "Hotel details and at least one image are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hotel_details
          (name, location, latitude, longitude, price, rating, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        hotelName.trim(),
        location.trim(),
        latitude,
        longitude,
        price,
        rating || "8.0",
        description.trim(),
        imagePath,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (!isServerless && files.length) {
      files.forEach((file) => file.path && fs.unlink(file.path, () => {}));
    }
    console.error("Error creating hotel:", error);
    res.status(500).json({ error: "Could not save hotel", details: error.message });
  }
});

app.put("/hotels/:id", upload.array("images", 10), async (req, res) => {
  const { hotelName, location, price, rating, description, latitude, longitude, image_url, src } = req.body;
  const files = req.files || [];

  if (!hotelName || !location || !price || !description || !latitude || !longitude) {
    if (!isServerless && files.length) {
      files.forEach((file) => file.path && fs.unlink(file.path, () => {}));
    }
    return res.status(400).json({ error: "Hotel details are required" });
  }

  try {
    const values = [
      hotelName.trim(),
      location.trim(),
      latitude,
      longitude,
      price,
      rating || "8.0",
      description.trim(),
    ];

    let newImagePath = null;
    if (files.length > 0) {
      newImagePath = getUploadedImagePath(files[0]);
    } else if (image_url || src) {
      newImagePath = image_url || src;
    }

    const imageClause = newImagePath ? ", image_url = $8" : "";
    if (newImagePath) {
      values.push(newImagePath);
    }

    const result = await pool.query(
      `UPDATE hotel_details
       SET name = $1, location = $2, latitude = $3, longitude = $4,
           price = $5, rating = $6, description = $7${imageClause}
       WHERE id = $${newImagePath ? 9 : 8}
       RETURNING *`,
      [...values, req.params.id]
    );

    if (!result.rowCount) {
      if (!isServerless && files.length) {
        files.forEach((file) => file.path && fs.unlink(file.path, () => {}));
      }
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (!isServerless && files.length) {
      files.forEach((file) => file.path && fs.unlink(file.path, () => {}));
    }
    console.error("Error updating hotel:", error);
    res.status(500).json({ error: "Could not update hotel", details: error.message });
  }
});

app.delete("/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM hotel_details WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).json({ error: "Could not delete hotel", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;