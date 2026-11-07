// Blog Content

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


// Display Blog Article

function readBlog(category) {

    let details = document.getElementById("blogDetails");

    let article = blogs[category];

    if (!article) return;

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


// Close Article

function closeArticle() {
    document.getElementById("blogDetails").innerHTML = "";
}


// Search Blogs

function searchBlogs() {

    let input = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    let cards = document.querySelectorAll(".blog-card");
    let details = document.getElementById("blogDetails");
    let noResult = document.getElementById("noResult");

    details.innerHTML = "";

    cards.forEach(card => {
        card.style.display = input === "" ? "block" : "none";
    });

    if (input === "") {
        noResult.style.display = "none";
        return;
    }

    let category = Object.keys(blogs).find(
        key => key.toLowerCase() === input
    );

    if (category) {
        noResult.style.display = "none";
        readBlog(category);
    } else {
        noResult.innerText = "No article found. Try Technology, Education or Lifestyle.";
        noResult.style.display = "block";
    }
}


// Demo Login

function loginUser(event) {

    event.preventDefault();

    document.getElementById("loginMessage").innerText =
        "Demo login submitted successfully!";
}
// Create New Blog

const createBlogForm = document.getElementById("createBlogForm");

if (createBlogForm) {

    createBlogForm.addEventListener("submit", function(event) {

        event.preventDefault();

        let title = document.getElementById("blogTitle").value;
        let category = document.getElementById("blogCategory").value;
        let image = document.getElementById("blogImage").value;
        let description = document.getElementById("blogDescription").value;

        let newBlog = {
            title: title,
            category: category,
            image: image,
            description: description
        };

        let savedBlogs = JSON.parse(localStorage.getItem("myBlogs")) || [];

        savedBlogs.push(newBlog);

        localStorage.setItem("myBlogs", JSON.stringify(savedBlogs));

        document.getElementById("publishMessage").innerText =
            "Your blog has been published successfully!";

        createBlogForm.reset();

    });

}