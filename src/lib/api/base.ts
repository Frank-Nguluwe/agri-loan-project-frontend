import { toast } from '@/hooks/use-toast';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BaseApiService {
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

    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

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
        description: 'Failed to connect to the server',
        variant: 'destructive',
      });
      throw new ApiError(0, 'Network request failed');
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json') 
      ? response.json() 
      : response.text() as unknown as T;
  }

  private async parseError(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }
}