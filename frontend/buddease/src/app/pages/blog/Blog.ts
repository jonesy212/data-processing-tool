// Blog.ts
// '@/app/types/Blog.ts'

export interface Blog {
    id: string; // Unique identifier for the blog
    title: string; // Title of the blog
    content: string; // Content of the blog
    author: string; // Author of the blog
    createdAt: Date; // Date and time when the blog was created
    updatedAt: Date; // Date and time when the blog was last updated
    // Add more properties as needed
  }
  