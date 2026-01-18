// BlogShare.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface BlogShareProps {
  blogId: string;
}

const BlogShare: React.FC<BlogShareProps> = ({ blogId }) => {
  const [blogData, setBlogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await axios.get(`/api/blogs/${blogId}`);
        setBlogData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [blogId]);

  const handleShare = async () => {
    // Implement your sharing logic here
    // Example: await axios.post(`/api/blogs/${blogId}/share`, { /* sharing data */ });

    // Display a success message or handle the response accordingly
    alert('Blog shared successfully!');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Share Blog</h2>
      <p>Blog Title: {blogData?.title}</p>
      <p>Content: {blogData?.content}</p>

      {/* Add your sharing form or UI components here */}
      <button onClick={handleShare}>Share Blog</button>
    </div>
  );
};

export default BlogShare;
