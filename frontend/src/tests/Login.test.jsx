// frontend/src/tests/Login.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Pages/Login';
import toast from 'react-hot-toast';

// We mock axios because your pages import axios directly
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));
import axios from 'axios';

describe('Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('logs in and stores token', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'JWT_TOKEN' } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/username/i), 'sahar');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    // URL in your code is "http://localhost:5000/api/auth/login"
    // We just check it ends with /api/auth/login to be robust
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/login$/),
      { username: 'sahar', password: 'secret12' }
    );
    expect(localStorage.getItem('token')).toBe('JWT_TOKEN');
  });

  test('shows error when backend rejects', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/username/i), 'sahar');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(toast.error).toHaveBeenCalled();
  });
});
