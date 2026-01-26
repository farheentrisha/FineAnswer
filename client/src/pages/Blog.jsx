import "../styles/Blog.css";


const blogData = [
  {
    title: "Why Study Abroad in Ireland?",
    date: "Jan 10, 2026",
    desc: "Discover why Ireland is one of the top destinations for Bangladeshi students seeking quality education and global exposure.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
  {
    title: "Ireland Student Visa: Step-by-Step Guide",
    date: "Jan 15, 2026",
    desc: "A complete breakdown of the Irish student visa process, required documents, and tips to avoid rejection.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
  },
  {
    title: "Cost of Living in Ireland for Students",
    date: "Jan 20, 2026",
    desc: "Understand accommodation, food, transport, and part-time job opportunities in Ireland.",
    image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d",
  },
];

export default function Blog() {
  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Study Abroad Blogs</h1>
        <p>Your trusted guide to studying abroad in Ireland</p>
      </div>

      <div className="blog-grid">
        {blogData.map((blog, index) => (
          <div className="blog-card" key={index}>
            <img src={blog.image} alt={blog.title} />
            <div className="blog-content">
              <span>{blog.date}</span>
              <h3>{blog.title}</h3>
              <p>{blog.desc}</p>
              <button>Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
