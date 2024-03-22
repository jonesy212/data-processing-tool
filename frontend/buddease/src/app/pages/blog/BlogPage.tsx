// BlogPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostsRequest } from './blogActions';
import { selectPosts } from './blogSelectors'; // Assuming the existence of a selector to retrieve posts
// import { BlogPost } from './types'; // Assuming the existence of a type for blog posts
import p from './BlogPost';

const BlogPage: React.FC = () => {
  const dispatch = useDispatch();
  const posts: BlogPost[] = useSelector(selectPosts);

  useEffect(() => {
    dispatch(fetchPostsRequest());
  }, [dispatch]);

  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post) => (
        <BlogPost
          key={post.id}
          title={post.title}
          content={post.content}
          author={post.author}
          date={post.date}
        />
      ))}
    </div>
  );
};

export default BlogPage;
