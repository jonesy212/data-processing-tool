// Blog.ts
export interface Blog {
  id: string; // Unique identifier for the blog
  title: string; // Title of the blog
  content: string; // Content of the blog
  author: string; // Author of the blog
  createdAt: Date; // Date and time when the blog was created
  updatedAt: Date; // Date and time when the blog was last updated
  articles: Article[];
  // Add more properties as needed
}

export interface Article {
  id: string; // Unique identifier for the article
  title: string; // Title of the article
  content: string; // Content of the article
  author: string; // Author of the article
  createdAt: Date; // Date and time when the article was created
  updatedAt: Date; // Date and time when the article was last updated
  // Add more properties as needed
}


interface NewsArticle extends Article{
  source: string; // Source of the news article (e.g., news website or publication)
  url: string; // URL to the full news article
  // Add more properties as needed
}


// Create a new blog
const newBlog: Blog = {
  id: "1",
  title: "Tech Blog",
  content: "A blog about technology",
  author: "John Doe",
  createdAt: new Date(),
  updatedAt: new Date(),
  articles: [], // Initialize the articles array
};

// Create a new article
const newArticle: Article = {
  id: "1",
  title: "Introduction to React",
  content: "This article provides an introduction to React.",
  author: "Jane Smith",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Associate the article with the blog
newBlog.articles.push(newArticle);

// Display the blog with associated articles
console.log(newBlog);

export type {NewsArticle}