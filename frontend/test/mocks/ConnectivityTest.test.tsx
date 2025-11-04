import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectivityTest from '../../src/pages/ConnectivityTest';
import { jest, describe, test, beforeEach, afterEach } from '@jest/globals';

describe('ConnectivityTest component', () => {
  beforeEach(() => {
    // mock global fetch (cast a any para evitar errores de tipos si no tienes @types configurado)
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders correctly with initial text', () => {
    render(<ConnectivityTest />);

    expect(screen.getByText('ConnectivityTest'));
    expect(screen.getByText('Check backend connectivity'));
    expect(
      screen.getByRole('button', { name: /check connectivity with the backend/i })
    );
  });
  
  test('shows error message on fetch failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ConnectivityTest />);

    fireEvent.click(screen.getByText(/check connectivity with the backend/i));

    await waitFor(() => {
      expect(screen.getByText('Error connecting to backend'));
    });
  });
});

function expect(arg0: any) {
  throw new Error('Function not implemented.');
}
