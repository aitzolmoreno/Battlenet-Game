import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../src/pages/Home/Home';
import { describe, test, expect } from '@jest/globals';

describe('Home component', () => {
  test('renders correctly with heading and paragraph', () => {
    render(<Home />);

    // Check heading
    expect(screen.getByText('WELLCOME TO BATTLENET!')).toBeTruthy();

    // Check paragraph
    expect(
      screen.getByText('Made by Mikel Etxarri, Aitzol Moreno, Ibon Muramendiaraz and Xanet Zaldua')
    ).toBeTruthy();
  });
});
