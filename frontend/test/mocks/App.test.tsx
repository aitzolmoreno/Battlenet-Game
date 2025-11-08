import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('App component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // silence errors
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('renders navigation links', () => {
    render(<App />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Test')).toBeTruthy();
    expect(screen.getByText('Game')).toBeTruthy();
  });

  test('renders Home component by default', () => {
    render(<App />);
    expect(screen.getByText(/WELLCOME TO BATTLENET!/i)).toBeTruthy();
  });

  test('navigates to Test page when clicking Test link', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Test'));

    expect(screen.getByText('Check backend connectivity')).toBeTruthy();
  });

  test('navigates to Game page when clicking Game link', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Game'));

    // Adjust this to some known text in your Game component
    expect(screen.getByText(/Game/i)).toBeTruthy();
  });
});
