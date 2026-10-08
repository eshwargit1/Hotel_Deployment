const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const uploadDirectory = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase();
        callback(null, `${Date.now()}-${baseName || "hotel-image"}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { files: 10, fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, file.mimetype.startsWith("image/"));
    }
});

app.use("/uploads", express.static(uploadDirectory));

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "hotel_management",
    password: "eshwar123",
    port: 5432
});

pool.connect()
    .then(() => {
        console.log("PostgreSQL connected successfully");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

app.get("/", (req, res) => {
    res.send("Express server is running");
});

app.get("/hotels", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM hotel_details");

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

app.post("/hotels", upload.array("images", 10), async (req, res) => {
    const { hotelName, location, price, rating, description, latitude, longitude } = req.body;
    const files = req.files || [];

    console.log(req.body);
    if (!hotelName || !location || !price || !description || !latitude || !longitude || !files.length) {
        files.forEach((file) => fs.unlinkSync(file.path));
        return res.status(400).json({ error: "Hotel details and at least one image are required" });
    }

    const imagePath = `/uploads/${files[0].filename}`;

    try {
        const result = await pool.query(
            `INSERT INTO hotel_details
                (name, location, latitude, longitude, price, rating, description, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [hotelName.trim(), location.trim(), latitude, longitude, price, rating || "8.0", description.trim(), imagePath]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        files.forEach((file) => fs.unlink(file.path, () => {}));
        console.error(error);
        res.status(500).json({ error: "Could not save hotel" });
    }
});

app.put("/hotels/:id", upload.array("images", 10), async (req, res) => {
    const { hotelName, location, price, rating, description, latitude, longitude } = req.body;
    const files = req.files || [];

    if (!hotelName || !location || !price || !description || !latitude || !longitude) {
        files.forEach((file) => fs.unlink(file.path, () => {}));
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
            description.trim()
        ];
        const imageClause = files.length ? ", image_url = $8" : "";
        if (files.length) {
            values.push(`/uploads/${files[0].filename}`);
        }

        const result = await pool.query(
            `UPDATE hotel_details
             SET name = $1, location = $2, latitude = $3, longitude = $4,
                 price = $5, rating = $6, description = $7${imageClause}
             WHERE id = $${files.length ? 9 : 8}
             RETURNING *`,
            [...values, req.params.id]
        );

        if (!result.rowCount) {
            files.forEach((file) => fs.unlink(file.path, () => {}));
            return res.status(404).json({ error: "Hotel not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        files.forEach((file) => fs.unlink(file.path, () => {}));
        console.error(error);
        res.status(500).json({ error: "Could not update hotel" });
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
        console.error(error);
        res.status(500).json({ error: "Could not delete hotel" });
    }
});