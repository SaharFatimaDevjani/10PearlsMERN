import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));
import axios from 'axios';

describe('Dashboard title', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'dummy');
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          data: { firstName: 'Sahar', lastName: 'Devjani', username: 'sahar' },
        });
      }
      if (url.includes('/api/notes')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it("shows \"Sahar Devjani's Notes\" in the header", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const heading = await screen.findByText(/Sahar Devjani's Notes/i);
    expect(heading).toBeInTheDocument();
  });
});
