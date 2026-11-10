
const API_URL = "http://localhost:5000/api";

// ================= STATIC BLOG CONTENT =================

const blogs = {
    "Technology": {
        title: "Technology & Innovation",
        intro: "Technology is changing the way people live, work and communicate.",
        features: [
            "Internet and Digital Communication",
            "Artificial Intelligence",
            "Smart Devices",
            "Automation and Robotics"
        ],
        benefits: [
            "Saves time and effort",
            "Improves communication",
            "Provides easy access to information",
            "Supports innovation"
        ],
        applications: [
            "Healthcare",
            "Education",
            "Banking",
            "Business"
        ]
    },

    "Education": {
        title: "Learning & Education",
        intro: "Education helps people gain knowledge, develop skills and build a better future.",
        features: [
            "Online Learning",
            "Digital Classrooms",
            "Interactive Study Materials",
            "Skill Development"
        ],
        benefits: [
            "Improves knowledge",
            "Develops confidence",
            "Creates career opportunities",
            "Improves problem-solving skills"
        ],
        applications: [
            "Schools and Colleges",
            "Online Courses",
            "Technical Training",
            "Research"
        ]
    },

    "Lifestyle": {
        title: "Healthy & Positive Lifestyle",
        intro: "A positive lifestyle includes good habits, proper time management and personal growth.",
        features: [
            "Daily Planning",
            "Healthy Habits",
            "Physical Activities",
            "Personal Development"
        ],
        benefits: [
            "Improves productivity",
            "Builds discipline",
            "Supports overall well-being",
            "Encourages positive thinking"
        ],
        applications: [
            "Daily Routine",
            "Time Management",
            "Learning New Skills",
            "Personal Goals"
        ]
    }
};


// ================= MESSAGE HELPER =================

function showMessage(elementId, message, success = false) {
    const element = document.getElementById(elementId);

    if (element) {
        element.innerText = message;
        element.style.color = success ? "green" : "red";
    }
}


// ================= REGISTER USER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            showMessage("registerMessage", "Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration Failed");
            }

            showMessage(
                "registerMessage",
                "Registration Successful! You can now Login.",
                true
            );

            registerForm.reset();

        } catch (error) {
            showMessage("registerMessage", error.message);
        }
    });
}


// ================= LOGIN USER =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login Failed");
            }

            localStorage.setItem("token", data.token);

            showMessage("loginMessage", "Login Successful!", true);

            window.location.href = "Index.html";

        } catch (error) {
            showMessage("loginMessage", error.message);
        }
    });
}


// ================= CREATE NEW BLOG =================

const createBlogForm = document.getElementById("createBlogForm");

if (createBlogForm) {
    createBlogForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            showMessage(
                "publishMessage",
                "Please Login first to publish a blog."
            );
            return;
        }

        const title = document.getElementById("blogTitle").value.trim();
        const category = document.getElementById("blogCategory").value;
        const content = document.getElementById("blogDescription").value.trim();

        try {
            const response = await fetch(`${API_URL}/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    category,
                    content
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Blog Creation Failed");
            }

            showMessage(
                "publishMessage",
                "Your Blog has been Published Successfully!",
                true
            );

            createBlogForm.reset();

        } catch (error) {
            showMessage("publishMessage", error.message);
        }
    });
}


// ================= DISPLAY STATIC BLOG ARTICLE =================

function readBlog(category) {
    const details = document.getElementById("blogDetails");
    const article = blogs[category];

    if (!details || !article) return;

    details.innerHTML = `
        <div class="search-result">

            <span class="tag">FEATURED ARTICLE</span>

            <h2>${article.title}</h2>

            <h3>Introduction</h3>
            <p>${article.intro}</p>

            <h3>Key Features</h3>
            <ul>
                ${article.features.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <h3>Benefits</h3>
            <ul>
                ${article.benefits.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <h3>Applications</h3>
            <ul>
                ${article.applications.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <button onclick="closeArticle()">Close Article</button>

        </div>
    `;

    details.scrollIntoView({ behavior: "smooth" });
}


// ================= DISPLAY BACKEND BLOG ARTICLE =================

async function readBackendBlog(id) {
    const details = document.getElementById("blogDetails");

    if (!details) return;

    try {
        const response = await fetch(`${API_URL}/blogs/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load blog");
        }

        const blog = data.blog;

        details.innerHTML = `
            <div class="search-result">
                <span class="tag">BLOG ARTICLE</span>
                <h2>${escapeHTML(blog.title)}</h2>
                <h3>Category</h3>
                <p>${escapeHTML(blog.category)}</p>
                <h3>Article Content</h3>
                <p>${escapeHTML(blog.content)}</p>
                <p>Author: ${escapeHTML(blog.author?.name || "Unknown")}</p>
                <button onclick="closeArticle()">Close Article</button>
            </div>
        `;

        details.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        details.innerText = error.message;
    }
}


// ================= HTML SAFE TEXT =================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// ================= CLOSE ARTICLE =================

function closeArticle() {
    const details = document.getElementById("blogDetails");

    if (details) {
        details.innerHTML = "";
    }
}


// ================= LOAD BLOGS FROM BACKEND =================

async function loadBackendBlogs() {
    const container = document.getElementById("blogContainer");

    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/blogs?page=1&limit=50`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load blogs");
        }

        const backendBlogs = data.blogs || [];

        backendBlogs.forEach(blog => {
            const card = document.createElement("div");

            card.className = "blog-card backend-blog-card";

            card.innerHTML = `
                <div class="card-content">
                    <span>${escapeHTML(blog.category)}</span>
                    <h3>${escapeHTML(blog.title)}</h3>
                    <p>${escapeHTML(blog.content.substring(0, 120))}...</p>
                    <button type="button">Read Article →</button>
                </div>
            `;

            card.querySelector("button").addEventListener("click", function() {
                readBackendBlog(blog._id);
            });

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Blog Loading Error:", error.message);
    }
}


// ================= SEARCH BLOGS =================

function searchBlogs() {
    const input = document.getElementById("searchInput");

    if (!input) return;

    const searchText = input.value.trim().toLowerCase();

    const cards = document.querySelectorAll(".blog-card");
    const details = document.getElementById("blogDetails");
    const noResult = document.getElementById("noResult");

    if (details) details.innerHTML = "";

    let visibleCount = 0;

    cards.forEach(card => {
        const cardText = card.innerText.toLowerCase();

        if (cardText.includes(searchText)) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (noResult) {
        if (visibleCount === 0 && searchText !== "") {
            noResult.innerText = "No article found. Try another topic or title.";
            noResult.style.display = "block";
        } else {
            noResult.style.display = "none";
        }
    }
}


// ================= LOAD HOME PAGE BLOGS =================

document.addEventListener("DOMContentLoaded", function() {
    loadBackendBlogs();
});
