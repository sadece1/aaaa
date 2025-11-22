import api from './api';
import { BlogPost, BlogFilters, PaginatedResponse } from '@/types';

// REMOVED: All mock data and localStorage - now using backend API only

export const blogService = {
  async getBlogs(filters?: BlogFilters, page = 1): Promise<PaginatedResponse<BlogPost>> {
      const response = await api.get<PaginatedResponse<BlogPost>>('/blogs', {
        params: { ...filters, page },
      });
    
    // Backend returns { success: true, data: [...], pagination: {...} }
    if ((response.data as any).success && (response.data as any).data) {
      return {
        data: (response.data as any).data,
        total: (response.data as any).pagination?.total || (response.data as any).data.length,
        page: (response.data as any).pagination?.page || page,
        limit: (response.data as any).pagination?.limit || 12,
        totalPages: (response.data as any).pagination?.totalPages || Math.ceil(((response.data as any).pagination?.total || (response.data as any).data.length) / 12),
      };
    }
    
    return response.data;
  },

  async getBlogById(id: string): Promise<BlogPost> {
    const response = await api.get<{ success: boolean; data: BlogPost } | BlogPost>(`/blogs/${id}`);
    
    // Backend returns { success: true, data: blog }
    if ((response.data as any).success && (response.data as any).data) {
      return (response.data as any).data;
    }
    
    return response.data as BlogPost;
  },

  async createBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    // Transform frontend format to backend format
    const backendData: any = {
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      author_avatar: blog.authorAvatar,
      category: blog.category,
      image: blog.image,
      read_time: (blog as any).read_time || blog.readTime || 5,
      published_at: (blog as any).published_at || blog.publishedAt || new Date().toISOString().split('T')[0],
      tags: blog.tags || [],
      featured: blog.featured || false,
      recommended_posts: (blog as any).recommended_posts || blog.recommendedPosts || [],
    };
    
    const response = await api.post<{ success: boolean; data: BlogPost } | BlogPost>('/blogs', backendData);
    
    // Backend returns { success: true, data: blog }
    if ((response.data as any).success && (response.data as any).data) {
      return (response.data as any).data;
    }
    
    return response.data as BlogPost;
  },

  async updateBlog(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const response = await api.put<{ success: boolean; data: BlogPost } | BlogPost>(`/blogs/${id}`, updates);
    
    // Backend returns { success: true, data: blog }
    if ((response.data as any).success && (response.data as any).data) {
      return (response.data as any).data;
    }
    
    return response.data as BlogPost;
  },

  async deleteBlog(id: string): Promise<void> {
      await api.delete(`/blogs/${id}`);
  },
};
