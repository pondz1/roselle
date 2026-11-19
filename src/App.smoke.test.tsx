import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App scaffold', () => {
  it('renders PinkBird title', () => {
    render(<App />);
    expect(screen.getByText('PinkBird')).toBeInTheDocument();
  });
});
