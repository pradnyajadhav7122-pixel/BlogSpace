
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ================= BLOG SCHEMA =================

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.send("BlogSpace Backend is Running!");
});

// ================= REGISTER API =================

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration Successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration Failed",
            error: error.message
        });
    }
});

// ================= LOGIN API =================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login Successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login Failed",
            error: error.message
        });
    }
});

// ================= AUTH MIDDLEWARE =================

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Please login."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// ================= CREATE BLOG =================

app.post("/api/blogs", verifyToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                message: "All blog fields are required"
            });
        }

        const newBlog = new Blog({
            title,
            content,
            category,
            author: req.userId
        });

        await newBlog.save();

        res.status(201).json({
            message: "Blog Created Successfully!",
            blog: newBlog
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog Creation Failed",
            error: error.message
        });
    }
});

// ================= SEARCH & FILTER BLOGS =================

app.get("/api/blogs/search", async (req, res) => {
    try {
        const { title, category } = req.query;

        const filter = {};

        if (title) {
            filter.title = {
                $regex: title,
                $options: "i"
            };
        }

        if (category) {
            filter.category = {
                $regex: category,
                $options: "i"
            };
        }

        const blogs = await Blog.find(filter)
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Search Completed Successfully!",
            count: blogs.length,
            blogs
        });

    } catch (error) {
        res.status(500).json({
            message: "Search Failed",
            error: error.message
        });
    }
});

// ================= GET ALL BLOGS WITH PAGINATION =================

app.get("/api/blogs", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit) || 5)
        );

        const skip = (page - 1) * limit;

        const totalBlogs = await Blog.countDocuments();

        const blogs = await Blog.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "Blogs Fetched Successfully!",
            currentPage: page,
            totalPages: Math.ceil(totalBlogs / limit),
            totalBlogs: totalBlogs,
            blogsPerPage: limit,
            count: blogs.length,
            blogs
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to Fetch Blogs",
            error: error.message
        });
    }
});

// ================= GET SINGLE BLOG =================

app.get("/api/blogs/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Blog ID"
            });
        }

        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email");

        if (!blog) {
            return res.status(404).json({
                message: "Blog Not Found"
            });
        }

        res.status(200).json({
            message: "Blog Fetched Successfully!",
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to Fetch Blog",
            error: error.message
        });
    }
});

// ================= UPDATE BLOG =================

app.put("/api/blogs/:id", verifyToken, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Blog ID"
            });
        }

        const { title, content, category } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog Not Found"
            });
        }

        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this blog"
            });
        }

        if (title !== undefined) blog.title = title;
        if (content !== undefined) blog.content = content;
        if (category !== undefined) blog.category = category;

        await blog.save();

        res.status(200).json({
            message: "Blog Updated Successfully!",
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog Update Failed",
            error: error.message
        });
    }
});

// ================= DELETE BLOG =================

app.delete("/api/blogs/:id", verifyToken, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Blog ID"
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog Not Found"
            });
        }

        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this blog"
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Blog Deleted Successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog Deletion Failed",
            error: error.message
        });
    }
});

// ================= SERVER & DATABASE =================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed:", error.message);
    });
