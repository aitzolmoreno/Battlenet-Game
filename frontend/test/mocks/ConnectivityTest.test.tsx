import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectivityTest from '../../src/pages/ConnectivityTest';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('ConnectivityTest component', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});  // para cubrir console.log
    jest.spyOn(console, 'error').mockImplementation(() => {}); // evitar logs feos
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('renders correctly with initial text', () => {
    render(<ConnectivityTest />);

    expect(screen.getByText('Test')).toBeTruthy();
    expect(screen.getByText('Check backend connectivity')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /check connectivity with the backend/i })
    ).toBeTruthy();
  });

  test('shows backend response on fetch success', async () => {
    // Simula que fetch devuelve un texto correctamente
    (global.fetch as any).mockResolvedValueOnce({
      text: () => Promise.resolve('OK from backend'),
    });

    render(<ConnectivityTest />);

    // Ejecuta el click para llamar al fetch
    fireEvent.click(screen.getByText(/check connectivity with the backend/i));

    // Espera a que aparezca el texto que se setea en el then()
    await waitFor(() => {
      expect(screen.getByText('Backend response: OK from backend')).toBeTruthy();
    });

    // Comprueba que console.log fue llamado (cubre esa línea)
    expect(console.log).toHaveBeenCalledWith('Backend response:', 'OK from backend');
  });

  test('shows error message on fetch failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ConnectivityTest />);

    fireEvent.click(screen.getByText(/check connectivity with the backend/i));

    await waitFor(() => {
      expect(screen.getByText('Error connecting to backend')).toBeTruthy();
    });

    expect(console.error).toHaveBeenCalled();
  });
});