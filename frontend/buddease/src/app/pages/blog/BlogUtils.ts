import { Blog } from "./Blog";

/**
 * Utility function to filter blogs by a specific category.
 * @param blogs Array of blogs to filter
 * @param category Category to filter by
 * @returns Filtered array of blogs
 */
export const filterBlogsByCategory = (blogs: Blog[], category: string): Blog[] => {
  if (!category) return blogs; // Return all blogs if category is not provided
  return blogs.filter(blog => blog.category === category);
};

/**
 * Utility function to sort blogs by date.
 * @param blogs Array of blogs to sort
 * @param descending Boolean flag to specify sorting order (default is true for descending order)
 * @returns Sorted array of blogs by date
 */
export const sortBlogsByDate = (blogs: Blog[], descending: boolean = true): Blog[] => {
  return blogs.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Utility function to search blogs by keyword in title or content.
 * @param blogs Array of blogs to search
 * @param keyword Keyword to search for
 * @returns Filtered array of blogs matching the keyword in title or content
 */
export const searchBlogsByKeyword = (blogs: Blog[], keyword: string): Blog[] => {
  if (!keyword.trim()) return blogs; // Return all blogs if keyword is not provided
  const lowerCaseKeyword = keyword.toLowerCase();
  return blogs.filter(blog => {
    const titleMatch = blog.title.toLowerCase().includes(lowerCaseKeyword);
    const contentMatch = blog.content.toLowerCase().includes(lowerCaseKeyword);
    return titleMatch || contentMatch;
  });
};

/**
 * Utility function to get the total number of words in a blog's content.
 * @param blog Blog object
 * @returns Total number of words in the blog's content
 */
export const countWordsInBlogContent = (blog: Blog): number => {
  const content = blog.content.trim();
  return content.split(/\s+/).length;
};
