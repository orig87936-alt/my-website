/**
 * API Client for Backend Integration
 * 
 * This module provides a centralized API client for communicating with the FastAPI backend.
 * It includes authentication, error handling, and typed API methods.
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// 🔍 调试：打印 API 配置
console.log('🔧 API Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL,
  API_VERSION,
  fullUrl: `${API_BASE_URL}${API_VERSION}`
});

// Types
export interface Article {
  id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  content_zh: ContentBlock[];
  content_en: ContentBlock[];
  category: string;
  author: string;
  published_at: string;
  image_url?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote';
  text?: string;
  items?: string[];
  level?: number;
  language?: string;
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ArticleListResponse {
  items: Article[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ArticleCreate {
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  content_zh: ContentBlock[];
  content_en: ContentBlock[];
  category: string;
  author: string;
  image_url?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface ArticleUpdate {
  title_zh?: string;
  title_en?: string;
  summary_zh?: string;
  summary_en?: string;
  lead_zh?: string;
  lead_en?: string;
  content_zh?: ContentBlock[];
  content_en?: ContentBlock[];
  category?: string;
  author?: string;
  image_url?: string;
  image_caption_zh?: string;
  image_caption_en?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone?: string;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  time_slot: string; // HH:MM format
  service_type?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmation_number?: string;
  notification_status: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreate {
  name: string;
  email: string;
  phone?: string;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  time_slot: string; // HH:MM format
  service_type?: string;
  notes?: string;
}

export interface AppointmentConfirmation {
  success: boolean;
  message: string;
  appointment: Appointment;
}

export interface AppointmentListResponse {
  items: Appointment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AvailableSlot {
  time_slot: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: AvailableSlot[];
}

// Auth token management
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Helper function to build headers
function buildHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
};

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get user-friendly error message
function getUserFriendlyErrorMessage(error: ApiError): string {
  const status = error.status;

  // Network errors
  if (status === 0) {
    return 'Network error. Please check your internet connection.';
  }

  // Client errors
  if (status === 400) return 'Invalid request. Please check your input.';
  if (status === 401) return 'Authentication required. Please log in.';
  if (status === 403) return 'Access denied. You do not have permission.';
  if (status === 404) return 'Resource not found.';
  if (status === 408) return 'Request timeout. Please try again.';
  if (status === 409) return 'Conflict. The resource already exists.';
  if (status === 422) return 'Validation error. Please check your input.';
  if (status === 429) return 'Too many requests. Please wait a moment.';

  // Server errors
  if (status >= 500) return 'Server error. Please try again later.';

  // Default to the detail message from the server
  return error.detail || 'An unexpected error occurred.';
}

// Generic fetch wrapper with error handling and retry logic
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false,
  retryCount: number = 0
): Promise<T> {
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;

  // 🔍 调试：打印请求信息
  console.log('📤 API Request:', {
    method: options.method || 'GET',
    endpoint,
    fullUrl: url,
    requireAuth,
    API_BASE_URL,
    API_VERSION
  });

  const config: RequestInit = {
    ...options,
    headers: {
      ...buildHeaders(requireAuth),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content responses (e.g., DELETE operations)
    if (response.status === 204) {
      return {} as T;
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        detail: data.detail || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && requireAuth && retryCount === 0) {
        console.log('🔄 Token expired, attempting to refresh...');
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          try {
            // Try to refresh the token
            const refreshResponse = await fetch(`${API_BASE_URL}${API_VERSION}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              setAuthToken(refreshData.access_token);
              console.log('✅ Token refreshed successfully, retrying request...');

              // Retry the original request with the new token
              return apiFetch<T>(endpoint, options, requireAuth, retryCount + 1);
            } else {
              console.log('❌ Token refresh failed, clearing auth data...');
              removeAuthToken();
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh error:', refreshError);
            removeAuthToken();
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }
      }

      // Check if we should retry
      const shouldRetry =
        retryCount < RETRY_CONFIG.maxRetries &&
        RETRY_CONFIG.retryableStatuses.includes(response.status) &&
        (options.method === 'GET' || options.method === undefined); // Only retry safe methods

      if (shouldRetry) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying request (${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`);
        await sleep(delay);
        return apiFetch<T>(endpoint, options, requireAuth, retryCount + 1);
      }

      // Add user-friendly message
      error.detail = getUserFriendlyErrorMessage(error);
      throw error;
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error && typeof error === 'object' && 'detail' in error) {
      throw error;
    }

    // Network or other errors
    const apiError: ApiError = {
      detail: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };

    // Check if we should retry network errors
    const shouldRetry =
      retryCount < RETRY_CONFIG.maxRetries &&
      (options.method === 'GET' || options.method === undefined); // Only retry safe methods

    if (shouldRetry) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying request after network error (${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`);
      await sleep(delay);
      return apiFetch<T>(endpoint, options, requireAuth, retryCount + 1);
    }

    // Add user-friendly message
    apiError.detail = getUserFriendlyErrorMessage(apiError);
    console.error('API Error:', error);
    throw apiError;
  }
}

// ============================================================================
// Articles API
// ============================================================================

export const articlesAPI = {
  /**
   * Get list of articles with pagination and filters
   */
  async list(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    status?: 'draft' | 'published' | 'archived';
    search?: string;
    exclude_id?: string;
  }): Promise<ArticleListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.exclude_id) queryParams.append('exclude_id', params.exclude_id);

    const query = queryParams.toString();
    const endpoint = `/articles${query ? `?${query}` : ''}`;

    return apiFetch<ArticleListResponse>(endpoint);
  },

  /**
   * Get a single article by ID
   */
  async get(id: string): Promise<Article> {
    return apiFetch<Article>(`/articles/${id}`);
  },

  /**
   * Create a new article (admin only)
   */
  async create(article: ArticleCreate): Promise<Article> {
    return apiFetch<Article>(
      '/articles',
      {
        method: 'POST',
        body: JSON.stringify(article),
      },
      true // Requires authentication
    );
  },

  /**
   * Update an existing article (admin only)
   */
  async update(id: string, article: ArticleUpdate): Promise<Article> {
    return apiFetch<Article>(
      `/articles/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(article),
      },
      true // Requires authentication
    );
  },

  /**
   * Delete an article (admin only)
   */
  async delete(id: string): Promise<void> {
    return apiFetch<void>(
      `/articles/${id}`,
      {
        method: 'DELETE',
      },
      true // Requires authentication
    );
  },

  /**
   * Get related articles (same category, excluding current article)
   */
  async getRelated(articleId: string, category: string, limit: number = 6): Promise<Article[]> {
    const response = await this.list({
      category,
      exclude_id: articleId,
      page_size: limit,
      status: 'published',
    });
    return response.items;
  },
};

// ============================================================================
// Appointments API
// ============================================================================

export const appointmentsAPI = {
  /**
   * Create a new appointment (public endpoint)
   */
  async create(appointment: AppointmentCreate): Promise<AppointmentConfirmation> {
    return apiFetch<AppointmentConfirmation>(
      '/appointments',
      {
        method: 'POST',
        body: JSON.stringify(appointment),
      },
      false // Public endpoint, no auth required
    );
  },

  /**
   * Get list of appointments (admin only)
   */
  async list(params?: {
    page?: number;
    page_size?: number;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
  }): Promise<AppointmentListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    const endpoint = `/appointments${query ? `?${query}` : ''}`;

    return apiFetch<AppointmentListResponse>(endpoint, {}, true);
  },

  /**
   * Get a single appointment by ID (admin only)
   */
  async get(id: string): Promise<Appointment> {
    return apiFetch<Appointment>(`/appointments/${id}`, {}, true);
  },

  /**
   * Update appointment status (admin only)
   */
  async update(id: string, data: { status?: string; notes?: string }): Promise<Appointment> {
    return apiFetch<Appointment>(
      `/appointments/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
  },

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    return apiFetch<AvailableSlotsResponse>(
      `/appointments/available-slots?date=${date}`,
      {},
      false // Public endpoint
    );
  },
};

// ============================================================================
// Health Check
// ============================================================================

export const healthAPI = {
  /**
   * Check if the API is healthy
   */
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiFetch<{ status: string; timestamp: string }>('/health');
  },
};

// ============================================================================
// Chat API
// ============================================================================

export interface SourceReference {
  type: 'faq' | 'article';
  id: string;
  title: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  sources: SourceReference[];
  response_time: number;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
  total: number;
}

export interface QuickQuestion {
  id: string;
  question: string;
  category?: string;
}

export interface QuickQuestionsResponse {
  questions: QuickQuestion[];
}

export const chatAPI = {
  /**
   * Send a message to the chatbot
   */
  async send(request: ChatRequest): Promise<ChatResponse> {
    return apiFetch<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: string, limit: number = 50): Promise<ChatHistoryResponse> {
    return apiFetch<ChatHistoryResponse>(`/chat/history/${sessionId}?limit=${limit}`);
  },

  /**
   * Get quick questions
   */
  async getQuickQuestions(): Promise<QuickQuestionsResponse> {
    return apiFetch<QuickQuestionsResponse>('/chat/quick-questions');
  },
};

// ============================================================================
// FAQ API
// ============================================================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category?: string;
  priority: number;
  is_active: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQCreate {
  question: string;
  answer: string;
  keywords?: string[];
  category?: string;
  priority?: number;
  is_active?: boolean;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  keywords?: string[];
  category?: string;
  priority?: number;
  is_active?: boolean;
}

export interface FAQListResponse {
  items: FAQ[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FAQSearchResult {
  id: string;
  question: string;
  answer: string;
  category?: string;
  score: number;
}

export interface FAQSearchResponse {
  results: FAQSearchResult[];
  total: number;
  query: string;
}

export const faqsAPI = {
  /**
   * Get FAQ list (admin only)
   */
  async list(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<FAQListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `/faqs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiFetch<FAQListResponse>(url);
  },

  /**
   * Search FAQs (public)
   */
  async search(query: string, limit: number = 10): Promise<FAQSearchResponse> {
    return apiFetch<FAQSearchResponse>(`/faqs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get FAQ by ID (admin only)
   */
  async get(id: string): Promise<FAQ> {
    return apiFetch<FAQ>(`/faqs/${id}`);
  },

  /**
   * Create FAQ (admin only)
   */
  async create(data: FAQCreate): Promise<FAQ> {
    return apiFetch<FAQ>('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update FAQ (admin only)
   */
  async update(id: string, data: FAQUpdate): Promise<FAQ> {
    return apiFetch<FAQ>(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete FAQ (admin only)
   */
  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/faqs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Authentication API
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  verification_code: string;
}



export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username?: string;
  display_name: string;
  avatar_url?: string;
  role: 'ADMIN' | 'USER' | 'VISITOR';
  auth_provider: 'EMAIL' | 'GOOGLE' | 'USERNAME';
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

// Legacy interface for backward compatibility
export interface UserInfo {
  username: string;
  is_admin: boolean;
}

export const authAPI = {
  /**
   * Admin login with username and password
   */
  async adminLogin(username: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Email login
   */
  async emailLogin(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    displayName: string,
    verificationCode?: string
  ): Promise<LoginResponse> {
    const requestBody: any = {
      email,
      password,
      display_name: displayName,
    };

    // Only include verification_code if provided
    if (verificationCode) {
      requestBody.verification_code = verificationCode;
    }

    return apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },



  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    return apiFetch<UserResponse>('/auth/me', {
      method: 'GET',
    }, true); // requireAuth = true
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiFetch<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<void> {
    return apiFetch<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Send verification code
   */
  async sendVerificationCode(email: string, purpose: string = 'register'): Promise<void> {
    return apiFetch<void>('/verification/send', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  },

  /**
   * Verify code
   */
  async verifyCode(email: string, code: string, purpose: string = 'register'): Promise<{ valid: boolean }> {
    return apiFetch<{ valid: boolean }>('/verification/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  },

  // ============================================================================
  // Legacy methods for backward compatibility
  // ============================================================================

  /**
   * Login with username and password (legacy)
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    return this.adminLogin(username, password);
  },

  /**
   * Get current user info from token (legacy)
   * Note: This decodes the JWT token client-side
   */
  getUserInfo(): UserInfo | null {
    const token = getAuthToken();
    if (!token) return null;

    try {
      // Decode JWT token (simple base64 decode of payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      return {
        username: decoded.email || decoded.sub || decoded.username,
        is_admin: decoded.role === 'ADMIN',
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },
};

// Export API base URL for reference
export { API_BASE_URL, API_VERSION };

// ============================================================================
// Translation API
// ============================================================================

/**
 * Translation request interface
 */
export interface TranslateRequest {
  text: string;
  source_lang?: 'zh' | 'en';
  target_lang: 'zh' | 'en';
}

/**
 * Translation response interface
 */
export interface TranslateResponse {
  translated_text: string;
  source_lang: string;
  target_lang: string;
  cached: boolean;
}

/**
 * Batch translate field interface
 */
export interface BatchTranslateField {
  field_name: string;
  text: string;
}

/**
 * Batch translate request interface
 */
export interface BatchTranslateRequest {
  fields: BatchTranslateField[];
  source_lang?: 'zh' | 'en';
  target_lang: 'zh' | 'en';
  article_id?: string;
}

/**
 * Batch translate field result interface
 */
export interface BatchTranslateFieldResult {
  field_name: string;
  translated_text: string;
  cached: boolean;
}

/**
 * Batch translate response interface
 */
export interface BatchTranslateResponse {
  results: BatchTranslateFieldResult[];
  source_lang: string;
  target_lang: string;
  total_fields: number;
  cached_count: number;
}

/**
 * Translate a single text field
 */
export async function translateText(request: TranslateRequest): Promise<TranslateResponse> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/translation/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Translation failed' }));
    throw new Error(error.detail || 'Translation failed');
  }

  return response.json();
}

/**
 * Batch translate multiple fields
 */
export async function batchTranslate(request: BatchTranslateRequest): Promise<BatchTranslateResponse> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/translation/batch-translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Batch translation failed' }));
    throw new Error(error.detail || 'Batch translation failed');
  }

  return response.json();
}

/**
 * Upload and parse a document (Markdown or Word)
 */
export interface UploadDocumentOptions {
  auto_translate?: boolean;
  target_lang?: string;
  category?: string;
}

export interface UploadDocumentResponse {
  upload_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_status: string;
  parse_result: {
    title: string;
    content_blocks: ContentBlock[];
    images: Array<{
      filename: string;
      url: string;
      alt?: string;
    }>;
    metadata: {
      summary?: string;
      category?: string;
      tags?: string[];
    };
  };
  uploaded_at: string;
}

export async function uploadDocument(
  file: File,
  options: UploadDocumentOptions = {}
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.auto_translate !== undefined) {
    formData.append('auto_translate', String(options.auto_translate));
  }
  if (options.target_lang) {
    formData.append('target_lang', options.target_lang);
  }
  if (options.category) {
    formData.append('category', options.category);
  }

  const response = await fetch(`${API_BASE_URL}${API_VERSION}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Document upload failed' }));
    throw new Error(error.detail || 'Document upload failed');
  }

  return response.json();
}

/**
 * Get document upload history
 */
export interface DocumentUploadHistoryResponse {
  items: Array<{
    upload_id: string;
    filename: string;
    file_type: string;
    file_size: number;
    upload_status: string;
    uploaded_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
}

export async function getDocumentHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<DocumentUploadHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}${API_VERSION}/documents/history?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch document history');
  }

  return response.json();
}

// ============================================================================
// Subscription API
// ============================================================================

export interface SubscriptionCreateRequest {
  email: string;
  subscription_type?: 'all' | 'headline' | 'regulatory' | 'analysis' | 'business' | 'enterprise' | 'outlook';
  frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface SubscriptionResponse {
  id: number;
  email: string;
  subscription_type: string;
  frequency: string;
  status: 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED';
  confirmed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionListResponse {
  items: SubscriptionResponse[];
  total: number;
  page: number;
  page_size: number;
}

export const subscriptionAPI = {
  /**
   * Create a new subscription
   */
  async create(data: SubscriptionCreateRequest): Promise<SubscriptionResponse> {
    return apiFetch<SubscriptionResponse>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all subscriptions (admin only)
   */
  async getAll(
    skip: number = 0,
    limit: number = 100,
    status?: string,
    subscriptionType?: string
  ): Promise<SubscriptionListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);
    if (subscriptionType) params.append('subscription_type', subscriptionType);

    return apiFetch<SubscriptionListResponse>(
      `/subscriptions?${params.toString()}`,
      { method: 'GET' },
      true // requireAuth = true for admin endpoint
    );
  },

  /**
   * Update subscription (admin only)
   */
  async update(
    id: number,
    data: {
      subscription_type?: string;
      frequency?: string;
      status?: string;
    }
  ): Promise<SubscriptionResponse> {
    return apiFetch<SubscriptionResponse>(
      `/subscriptions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true // requireAuth = true for admin endpoint
    );
  },

  /**
   * Delete subscription (admin only)
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(
      `/subscriptions/${id}`,
      { method: 'DELETE' },
      true // requireAuth = true for admin endpoint
    );
  },
};

