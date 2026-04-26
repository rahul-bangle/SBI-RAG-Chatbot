import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PulseInsights from '../PulseInsights';
import React from 'react';

// Mock the global fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('Mocked markdown content'),
  })
);

describe('PulseInsights Component', () => {
  it('renders 5 theme cards when pulse_data.json is loaded', async () => {
    render(<PulseInsights />);
    
    // We expect 5 theme cards to be rendered.
    // Based on PulseInsights.jsx current implementation, it only renders markdown,
    // so this test should definitely fail as there are no "theme cards".
    const themeCards = await screen.findAllByTestId('theme-card');
    expect(themeCards.length).toBe(5);
  });
});
