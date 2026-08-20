import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Job Scraper Intelligence Platform app', () => {
  render(<App />);
  const headingElement = screen.getByText(/Job Scraper Intelligence Platform/i);
  expect(headingElement).toBeInTheDocument();
});
