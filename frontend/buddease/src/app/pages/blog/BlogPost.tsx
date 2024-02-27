// BlogPost.tsx

const BlogPost = ({ title, content, author, date }) => {
  return (
    <div className="blog-post">
      <h2 className="blog-post-title">{title}</h2>
      <div className="blog-post-meta">
        <span className="author">Author: {author}</span>
        <span className="date">Date: {date}</span>
      </div>
      <div className="blog-post-content">
        {content}
      </div>
    </div>
  );
};

export default BlogPost;
