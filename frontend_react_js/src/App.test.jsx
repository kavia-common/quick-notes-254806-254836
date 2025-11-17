import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders brand name', () => {
  render(<App />);
  const brand = screen.getByText(/Quick Notes/i);
  expect(brand).toBeInTheDocument();
});
