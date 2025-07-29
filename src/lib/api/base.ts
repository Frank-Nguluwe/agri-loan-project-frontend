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
        this.clearToken();

        toast({
          title: 'Session Expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });

        // IMPORTANT: Do NOT reload the page here!
        throw new ApiError(401, 'Not authenticated');
      }

      if (!response.ok) {
        const errorData = await this.parseError(response);
        console.error('[API Error]', response.status, errorData);

        toast({
          title: `API Error (${response.status})`,
          description: errorData.message || response.statusText,
          variant: 'destructive',
        });

        throw new ApiError(
          response.status,
          errorData.message || response.statusText,
          errorData
        );
      }

      return await this.parseResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[Network Error]', error);

      toast({
        title: 'Network Error',
        description: 'Failed to connect to the server. Please check your connection.',
        variant: 'destructive',
      });

      throw new ApiError(
        0,
        'Network request failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
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

  protected async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, body: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  protected async put<T>(endpoint: string, body: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  protected async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}
