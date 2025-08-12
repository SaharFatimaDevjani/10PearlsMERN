// frontend/src/tests/Signup.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Pages/Signup';
import toast from 'react-hot-toast';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));
import axios from 'axios';

describe('Signup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('blocks when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/first name/i), 'Sahar');
    await userEvent.type(screen.getByPlaceholderText(/last name/i), 'Devjani');
    await userEvent.type(screen.getByPlaceholderText(/^username$/i), 'sahar');
    await userEvent.type(screen.getByPlaceholderText(/^email$/i), 'sahar@example.com');
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), 'secret12');
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'different');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(toast.error).toHaveBeenCalled(); // "Passwords do not match"
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('sends register request on valid form', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/first name/i), 'Sahar');
    await userEvent.type(screen.getByPlaceholderText(/last name/i), 'Devjani');
    await userEvent.type(screen.getByPlaceholderText(/^username$/i), 'sahar');
    await userEvent.type(screen.getByPlaceholderText(/^email$/i), 'sahar@example.com');
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), 'secret12');
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'secret12');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/register$/),
      expect.objectContaining({
        firstName: 'Sahar',
        lastName: 'Devjani',
        username: 'sahar',
        email: 'sahar@example.com',
        password: 'secret12',
      })
    );
  });
});
