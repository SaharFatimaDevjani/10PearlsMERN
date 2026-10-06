// frontend/src/tests/Logout.test.jsx
// Checks the Dashboard "Logout" button clears the stored session and
// sends the user back to /login.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));
import axios from 'axios';

describe('Logout', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'dummy');
    localStorage.setItem('username', 'sahar');
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { firstName: 'Sahar', lastName: 'Devjani' } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('clears the token and redirects to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /logout/i }));

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });
});
