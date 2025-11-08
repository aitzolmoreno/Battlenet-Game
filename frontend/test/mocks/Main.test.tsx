// test/mocks/main.test.tsx
import '@testing-library/jest-dom';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

jest.mock('../../src/App.tsx', () => ({
  __esModule: true,
  default: () => null, // componente mock que no renderiza nada real
}));

// Mock de react-dom/client: createRoot devuelve un objeto con render mockeado
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn() })),
}));

describe('main.tsx', () => {
  beforeEach(() => {
    jest.resetModules(); // limpia el cache de módulos entre tests
    // Asegura que exista el elemento root en el DOM (como en index.html)
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    // opcional: silencia errores/prints durante el test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('calls createRoot with #root and calls render once', async () => {
    // Importa el módulo AFTER haber configurado los mocks arriba.
    // Al importar, main.tsx ejecutará createRoot(...).render(...)
    // usamos require para que la importación ocurra en tiempo de ejecución
    require('../../src/main');

    const reactDom = require('react-dom/client');

    // createRoot debería haber sido llamado una vez con el elemento #root
    expect(reactDom.createRoot).toHaveBeenCalledTimes(1);
    expect(reactDom.createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  });
});
