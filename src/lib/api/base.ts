import { toast } from '@/hooks/use-toast';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class BaseApiService {
  protected token: string | null = null;
  protected baseUrl: string;

  constructor(basePath: string = '') {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://agri-loan-api.onrender.com'}${basePath}`;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new ApiError(401, 'Not authenticated');
      }

      if (!response.ok) {
        const errorData = await this.parseError(response);
        this.handleApiError(response.status, errorData);
        throw new ApiError(response.status, errorData.message || response.statusText, errorData);
      }

      return await this.parseResponse<T>(response);
    } catch (error) {
      this.handleNetworkError(error);
      throw error;
    }
  }

  private handleUnauthorized() {
    this.clearToken();
    toast({
      title: 'Session Expired',
      description: 'Please log in again.',
      variant: 'destructive',
    });
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  private async parseError(response: Response): Promise<{ message?: string; [key: string]: any }> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  private handleApiError(status: number, errorData: any) {
    console.error('[API Error]', status, errorData);
    toast({
      title: `API Error (${status})`,
      description: errorData.message || 'Request failed',
      variant: 'destructive',
    });
  }

  private handleNetworkError(error: unknown) {
    if (error instanceof ApiError) return;
    
    console.error('[Network Error]', error);
    toast({
      title: 'Network Error',
      description: 'Failed to connect to the server. Please check your connection.',
      variant: 'destructive',
    });
  }

  protected setToken(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  public getToken(): string | null {
    if (this.token) return this.token;
    const token = localStorage.getItem('access_token');
    this.token = token;
    return token;
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('access_token');
  }
}