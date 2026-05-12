import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';
import { ENV_CONFIG } from '../config/environments';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  failOnStatusCode?: boolean;
}

/**
 * ApiClient — thin wrapper around Playwright's APIRequestContext.
 *
 * Provides typed request helpers, automatic base URL resolution,
 * auth token injection, and structured response validation.
 */
export class ApiClient {
  private authToken: string | null = null;

  constructor(private readonly request: APIRequestContext) {}

  // ── Auth ────────────────────────────────────────────────────────────────────

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  // ── Base helpers ─────────────────────────────────────────────────────────────

  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra,
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${ENV_CONFIG.apiBaseUrl}${path}`;
  }

  // ── HTTP methods ─────────────────────────────────────────────────────────────

  async get(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.get(this.resolveUrl(path), {
      headers: this.buildHeaders(options.headers),
      params: options.params as Record<string, string>,
    });
  }

  async post(path: string, data: unknown, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.post(this.resolveUrl(path), {
      headers: this.buildHeaders(options.headers),
      data,
    });
  }

  async put(path: string, data: unknown, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.put(this.resolveUrl(path), {
      headers: this.buildHeaders(options.headers),
      data,
    });
  }

  async patch(path: string, data: unknown, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.patch(this.resolveUrl(path), {
      headers: this.buildHeaders(options.headers),
      data,
    });
  }

  async delete(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.delete(this.resolveUrl(path), {
      headers: this.buildHeaders(options.headers),
    });
  }

  // ── Response helpers ──────────────────────────────────────────────────────────

  async assertStatus(response: APIResponse, status: number): Promise<void> {
    expect(response.status()).toBe(status);
  }

  async assertOk(response: APIResponse): Promise<void> {
    expect(response.ok()).toBeTruthy();
  }

  async getJson<T>(response: APIResponse): Promise<T> {
    return response.json() as Promise<T>;
  }

  // ── Auth flow helper ──────────────────────────────────────────────────────────

  async authenticate(email: string, password: string): Promise<string> {
    const response = await this.post('/auth/login', { email, password });
    await this.assertOk(response);
    const body = await this.getJson<{ token: string; accessToken: string }>(response);
    const token = body.token ?? body.accessToken;
    this.setAuthToken(token);
    return token;
  }
}
