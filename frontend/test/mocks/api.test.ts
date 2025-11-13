// test/mocks/api.test.ts
import { apiFetch } from '../../src/lib/api';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('apiFetch API wrapper', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('makes a successful GET request with JSON response', async () => {
    const mockData = { message: 'success', data: [1, 2, 3] };
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      })
    );

    const result = await apiFetch('/api/test');
    
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    }));
  });

  test('makes a successful POST request with body', async () => {
    const mockData = { id: 123 };
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      })
    );

    const result = await apiFetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/create', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    }));
  });

  test('handles empty response body', async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
      })
    );

    const result = await apiFetch('/api/empty');
    
    expect(result).toBeNull();
  });

  test('returns raw text when JSON parsing fails', async () => {
    const rawText = 'not valid json';
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(rawText),
      })
    );

    const result = await apiFetch('/api/text');
    
    expect(result).toBe(rawText);
  });

  test('throws error on non-ok response', async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      })
    );

    await expect(apiFetch('/api/missing')).rejects.toThrow('API error 404: Not Found');
  });

  test('throws error on server error response', async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      })
    );

    await expect(apiFetch('/api/error')).rejects.toThrow('API error 500: Internal Server Error');
  });

  test('adds leading slash to path if missing', async () => {
    const mockData = { test: true };
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      })
    );

    await apiFetch('api/test');
    
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
  });

  test('merges custom headers with default headers', async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{}'),
      })
    );

    await apiFetch('/api/test', {
      headers: {
        'X-Custom-Header': 'custom-value',
      } as any,
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      credentials: 'include',
    }));
    
    // Verify the custom header was passed
    const callArgs = (global.fetch as any).mock.calls[0][1];
    expect(callArgs.headers['X-Custom-Header']).toBe('custom-value');
  });
});
