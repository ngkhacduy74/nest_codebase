import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '@/common/services/logger.service';

export interface ApiTestResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

export class ApiTestClient {
  private app: INestApplication;
  private baseUrl: string;
  private cookies: Record<string, string> = {};

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.app = app;
    this.baseUrl = `http://localhost:${this.configService.get('app.port', 3000)}`;
  }

  async get(endpoint: string, options?: {
    headers?: Record<string, string>;
    query?: Record<string, any>;
  }): Promise<ApiTestResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    await this.logger.trace(`API GET: ${url}`, {
      method: 'GET',
      url,
      headers: options?.headers,
      query: options?.query,
    });

    const response = await this.app.get(url)
      .set('Cookie', this.formatCookies())
      .query(options?.query || {})
      .set(options?.headers || {});

    return this.formatResponse(response);
  }

  async post(endpoint: string, data?: any, options?: {
    headers?: Record<string, string>;
    query?: Record<string, any>;
  }): Promise<ApiTestResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    await this.logger.trace(`API POST: ${url}`, {
      method: 'POST',
      url,
      data,
      headers: options?.headers,
      query: options?.query,
    });

    const response = await this.app.post(url)
      .set('Cookie', this.formatCookies())
      .query(options?.query || {})
      .set(options?.headers || {})
      .send(data);

    return this.formatResponse(response);
  }

  async put(endpoint: string, data?: any, options?: {
    headers?: Record<string, string>;
    query?: Record<string, any>;
  }): Promise<ApiTestResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    await this.logger.trace(`API PUT: ${url}`, {
      method: 'PUT',
      url,
      data,
      headers: options?.headers,
      query: options?.query,
    });

    const response = await this.app.put(url)
      .set('Cookie', this.formatCookies())
      .query(options?.query || {})
      .set(options?.headers || {})
      .send(data);

    return this.formatResponse(response);
  }

  async patch(endpoint: string, data?: any, options?: {
    headers?: Record<string, string>;
    query?: Record<string, any>;
  }): Promise<ApiTestResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    await this.logger.trace(`API PATCH: ${url}`, {
      method: 'PATCH',
      url,
      data,
      headers: options?.headers,
      query: options?.query,
    });

    const response = await this.app.patch(url)
      .set('Cookie', this.formatCookies())
      .query(options?.query || {})
      .set(options?.headers || {})
      .send(data);

    return this.formatResponse(response);
  }

  async delete(endpoint: string, options?: {
    headers?: Record<string, string>;
    query?: Record<string, any>;
  }): Promise<ApiTestResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    await this.logger.trace(`API DELETE: ${url}`, {
      method: 'DELETE',
      url,
      headers: options?.headers,
      query: options?.query,
    });

    const response = await this.app.delete(url)
      .set('Cookie', this.formatCookies())
      .query(options?.query || {})
      .set(options?.headers || {});

    return this.formatResponse(response);
  }

  setAuth(token: string): void {
    this.cookies['auth-token'] = token;
  }

  clearAuth(): void {
    delete this.cookies['auth-token'];
  }

  private formatCookies(): string {
    return Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  private formatResponse(response: Response): ApiTestResponse {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const cookies: Record<string, string> = {};
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      cookieStrings.forEach(cookieString => {
        const [name] = cookieString.split('=')[0];
        if (name) {
          cookies[name] = cookieString;
        }
      });
    }

    return {
      status: response.status,
      data: response.body,
      headers,
      cookies,
    };
  }
}

export class ApiTestAssertions {
  static assertStatus(response: ApiTestResponse, expectedStatus: number, message?: string): void {
    if (response.status !== expectedStatus) {
      throw new Error(message || `Expected status ${expectedStatus}, but got ${response.status}`);
    }
  }

  static assertSuccess(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 200, message || 'Expected success response');
  }

  static assertCreated(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 201, message || 'Expected created response');
  }

  static assertBadRequest(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 400, message || 'Expected bad request response');
  }

  static assertUnauthorized(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 401, message || 'Expected unauthorized response');
  }

  static assertForbidden(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 403, message || 'Expected forbidden response');
  }

  static assertNotFound(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 404, message || 'Expected not found response');
  }

  static assertConflict(response: ApiTestResponse, message?: string): void {
    this.assertStatus(response, 409, message || 'Expected conflict response');
  }

  static assertDataStructure(response: ApiTestResponse, expectedStructure: any, message?: string): void {
    if (!this.matchesStructure(response.data, expectedStructure)) {
      throw new Error(message || `Response data structure does not match expected structure`);
    }
  }

  static assertContains(response: ApiTestResponse, expectedValue: any, path?: string, message?: string): void {
    const actualValue = path ? this.getNestedValue(response.data, path) : response.data;
    
    if (!this.containsValue(actualValue, expectedValue)) {
      const pathInfo = path ? ` at path "${path}"` : '';
      throw new Error(message || `Expected response to contain ${expectedValue}${pathInfo}`);
    }
  }

  static assertHeader(response: ApiTestResponse, headerName: string, expectedValue: string, message?: string): void {
    const actualValue = response.headers[headerName.toLowerCase()];
    if (actualValue !== expectedValue) {
      throw new Error(message || `Expected header ${headerName} to be ${expectedValue}, but got ${actualValue}`);
    }
  }

  private static matchesStructure(actual: any, expected: any): boolean {
    if (typeof actual !== typeof expected) {
      return false;
    }

    if (typeof actual !== 'object' || actual === null) {
      return actual === expected;
    }

    for (const key in expected) {
      if (!(key in actual)) {
        return false;
      }
      
      if (!this.matchesStructure(actual[key], expected[key])) {
        return false;
      }
    }

    return true;
  }

  private static containsValue(actual: any, expected: any): boolean {
    if (typeof expected === 'string' && typeof actual === 'string') {
      return actual.includes(expected);
    }

    if (Array.isArray(expected) && Array.isArray(actual)) {
      return expected.every(item => actual.includes(item));
    }

    if (typeof expected === 'object' && typeof actual === 'object') {
      for (const key in expected) {
        if (!this.containsValue(actual[key], expected[key])) {
          return false;
        }
      }
      return true;
    }

    return actual === expected;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export class TestModuleBuilder {
  private imports: any[] = [];
  private providers: any[] = [];
  private controllers: any[] = [];

  static create(): TestModuleBuilder {
    return new TestModuleBuilder();
  }

  withImport(importModule: any): TestModuleBuilder {
    this.imports.push(importModule);
    return this;
  }

  withProvider(provider: any): TestModuleBuilder {
    this.providers.push(provider);
    return this;
  }

  withController(controller: any): TestModuleBuilder {
    this.controllers.push(controller);
    return this;
  }

  async compile(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [...this.imports],
      providers: [...this.providers],
      controllers: [...this.controllers],
    });
  }
}
