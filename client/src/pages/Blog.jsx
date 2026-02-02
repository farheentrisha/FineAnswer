import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../styles/Blog.css";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
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

  const calculateReadTime = (content = "") => {
    const words = content.split(" ").length;
    return Math.max(1, Math.ceil(words / 200));
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="blog-page blog-page-offset">
        <div className="blog-loading-state">
          <div className="blog-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page blog-page-offset">
      {/* Back Button */}
      <button
        className="blog-back-nav"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}
      <div className="blog-header animated-fade-down">
        <h1>
          <span>Study Abroad</span> Insights & Stories
        </h1>
        <p>
          Smart guides, expert opinions, and student success stories — all in one place.
        </p>
      </div>

      {/* Empty State */}
      {blogs.length === 0 ? (
        <div className="blog-empty-state">
          <p>No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="blog-list">
          {blogs.map((blog, index) => (
            <div
              className="blog-list-item animated-reveal"
              style={{ animationDelay: `${index * 0.08}s` }}
              key={blog._id}
            >
              {/* Image */}
              <div className="blog-thumb">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} />
                ) : (
                  <div className="blog-thumb-placeholder" />
                )}
              </div>

              {/* Content */}
              <div className="blog-info">
                <h2 className="blog-title">{blog.title}</h2>

                <div className="blog-meta">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span>• {calculateReadTime(blog.content)} min read</span>
                  {blog.views && (
                    <span className="blog-views">{blog.views} Views</span>
                  )}
                </div>

                {blog.category && (
                  <div className="blog-category-pill">
                    {blog.category}
                  </div>
                )}

                <Link
                  to={`/blog/${blog._id}`}
                  className="blog-read-link gradient-hover"
                >
                  Read article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
