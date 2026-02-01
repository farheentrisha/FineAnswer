import { useState, useEffect } from "react";
import "../styles/Blog.css";

const API_BASE = "http://localhost:5000/api";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/blogs`);
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-header">
          <h1>Study Abroad Blogs</h1>
          <p>Stay updated with our latest news and articles</p>
        </div>
        <div className="blog-loading-state">
          <div className="blog-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Study Abroad Blogs</h1>
        <p>Stay updated with our latest news and articles</p>
      </div>

      {blogs.length === 0 ? (
        <div className="blog-empty-state">
          <p>No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <div className="blog-card" key={blog._id}>
              {blog.image ? (
                <img src={blog.image} alt={blog.title} />
              ) : (
                <div className="blog-card-image-placeholder" />
              )}
              <div className="blog-content">
                <span>{formatDate(blog.createdAt)}</span>
                <h3>{blog.title}</h3>
                <p>{truncateText(blog.content, 120)}</p>
                <button>Read More</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
