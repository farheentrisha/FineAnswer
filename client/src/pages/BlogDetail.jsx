import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/Blog.css";

const API_BASE = "fine-answer.vercel.app/api";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/blogs/${id}`);
      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.message || "Blog not found");
      }
    } catch (err) {
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="blog-page blog-detail-page">
        <div className="blog-loading-state">
          <div className="blog-spinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-page blog-detail-page">
        <div className="blog-error-state">
          <p>{error || "Blog not found"}</p>
          <Link to="/blog" className="blog-back-link">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page blog-detail-page">
      <article className="blog-detail">
        <Link to="/blog" className="blog-back-link">
          ← Back to Blogs
        </Link>

        <div className="blog-detail-header">
          <span className="blog-detail-date">{formatDate(blog.createdAt)}</span>
          {blog.author && (
            <span className="blog-detail-author">By {blog.author}</span>
          )}
          <h1 className="blog-detail-title">{blog.title}</h1>
        </div>

        {blog.image && (
          <div className="blog-detail-image-wrapper">
            <img src={blog.image} alt={blog.title} className="blog-detail-image" />
          </div>
        )}

        <div className="blog-detail-content">
          <p className="blog-detail-body">{blog.content}</p>
        </div>

        <div className="blog-detail-footer">
          <Link to="/blog" className="blog-back-btn">
            ← Back to All Blogs
          </Link>
        </div>
      </article>
    </div>
  );
}
