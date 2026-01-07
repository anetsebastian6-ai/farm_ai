require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const User = require('./models/User');
const Product = require('./models/Product');
const Setting = require('./models/Setting');
const Order = require('./models/Order');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// Register Route
app.post('/api/register', async (req, res) => {
  console.log("📝 Register Request:", req.body);
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password, // Note: In a real app, hash this password!
      role
    });

    await newUser.save();
    console.log("✅ User registered:", email);
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  console.log("🔑 Login Request:", req.body.email, "Role:", req.body.role);
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate Role if provided
    if (role && user.role !== role) {
      return res.status(400).json({ message: `Please login as a ${user.role}` });
    }

    console.log("✅ Login success:", email);
    res.json({
      message: "Login success",
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Disease Detection Route
app.post('/api/detect-disease', upload.single('image'), async (req, res) => {
  console.log("📸 Image received for detection");
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Forward to Python AI Service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    // The Python Flask service base URL. Configure with FLASK_URL in .env
    const pythonBaseUrl = process.env.FLASK_URL || 'http://127.0.0.1:7000';
    const targetUrl = `${pythonBaseUrl}/disease-predict`;

    console.log(`🔄 Forwarding to AI Service: ${targetUrl}`);

    const response = await axios.post(targetUrl, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log("✅ AI Response:", response.data);

    // Clean up uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("⚠️ Failed to delete temp file:", err);
    });

    res.json(response.data);

  } catch (err) {
    console.error("❌ Detection Error:", err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "AI Service Unavailable",
        details: "Please ensure the Python AI service is running on port 7000."
      });
    }
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// AI health-check route: pings the Flask service check endpoint
app.get('/api/ai-health', async (req, res) => {
  const pythonBaseUrl = process.env.FLASK_URL || 'http://127.0.0.1:7000';
  const healthUrl = `${pythonBaseUrl}/check-get`;
  try {
    const resp = await axios.get(healthUrl, { timeout: 3000 });
    if (resp && resp.status === 200) {
      return res.json({ status: 'ok', service: 'flask', details: resp.data });
    }
    return res.status(502).json({ status: 'unhealthy', service: 'flask' });
  } catch (err) {
    console.error('AI Health Check Error:', err.message);
    return res.status(503).json({ status: 'unavailable', error: err.message });
  }
});


// --- PRODUCT ROUTES ---

// Add a Product
app.post('/api/products', upload.single('image'), async (req, res) => {
  console.log("📦 Add Product Request:", req.body);
  try {
    const { name, description, price, category, quantity, unit, farmerId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    if (!name || !price || !category || !farmerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fix image path for frontend (remove 'uploads\' prefix if present and ensure forward slashes)
    // We'll store the relative path that the frontend can serve
    // Assuming we serve 'uploads' directory as static files
    const imagePath = `/uploads/${req.file.filename}`;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      quantity,
      unit,
      image: imagePath,
      farmer: farmerId
    });

    await newProduct.save();
    console.log("✅ Product added:", name);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Add Product Error:", err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// Get Products by Farmer
app.get('/api/products/farmer/:farmerId', async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.params.farmerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("❌ Get Products Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: Delete image file associated with product
    // const filePath = path.join(__dirname, product.image);
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Delete Product Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get ALL Products (Public Feed for Customers)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const products = await Product.find(query)
      .populate('farmer', 'name email') // Include simple farmer details
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("❌ Get All Products Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- ORDER ROUTES ---

// Place a New Order
app.post('/api/orders', async (req, res) => {
  console.log("🛒 New Order Request:", req.body);
  try {
    const { customerId, items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!customerId || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const newOrder = new Order({
      customer: customerId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    await newOrder.save();
    console.log("✅ Order placed:", newOrder._id);
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Place Order Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Orders for a Customer
app.get('/api/orders/customer/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Get Customer Orders Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Orders containing products from a specific Farmer
// (Note: This is a bit complex since an order might have products from multiple farmers. 
//  We filter items relevant to the farmer).
app.get('/api/orders/farmer/:farmerId', async (req, res) => {
  try {
    // efficient strategy: find orders where at least one item's product belongs to this farmer
    // First find all products by this farmer
    const farmerProducts = await Product.find({ farmer: req.params.farmerId }).select('_id');
    const farmerProductIds = farmerProducts.map(p => p._id);

    const orders = await Order.find({ 'items.product': { $in: farmerProductIds } })
      .populate('items.product')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // We might want to filter the items inside the order response to only show this farmer's products, 
    // but sending the full order is okay for now.
    res.json(orders);
  } catch (err) {
    console.error("❌ Get Farmer Orders Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Google Image Search Proxy (uses environment GOOGLE_API_KEY and GOOGLE_CX)
app.get('/api/search-image', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CX = process.env.GOOGLE_CX;

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return res.status(500).json({ error: 'Google API key or CX not configured on server' });
  }

  try {
    const url = 'https://www.googleapis.com/customsearch/v1';
    const response = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q,
        searchType: 'image',
        num: 1,
        safe: 'off'
      }
    });

    if (response.data && response.data.items && response.data.items.length) {
      const item = response.data.items[0];
      return res.json({ link: item.link });
    }

    return res.status(404).json({ error: 'No image found' });
  } catch (err) {
    console.error('Google search error:', err.message);
    return res.status(500).json({ error: 'Google search failed', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// --- SETTINGS ROUTES ---
// Get settings for a user
app.get('/api/settings/:userId', async (req, res) => {
  try {
    const setting = await Setting.findOne({ user: req.params.userId });
    if (!setting) return res.json({});
    res.json(setting);
  } catch (err) {
    console.error('❌ Get Settings Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Upsert settings for a user
app.put('/api/settings/:userId', async (req, res) => {
  try {
    const updates = req.body || {};
    updates.updatedAt = Date.now();
    const setting = await Setting.findOneAndUpdate({ user: req.params.userId }, { $set: updates, $setOnInsert: { user: req.params.userId } }, { upsert: true, new: true });
    res.json(setting);
  } catch (err) {
    console.error('❌ Update Settings Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});