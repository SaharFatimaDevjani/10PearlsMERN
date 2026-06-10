// frontend/src/tests/ProfilePage.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../Pages/ProfilePage';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));
import axios from 'axios';

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'dummy');

    axios.get.mockResolvedValueOnce({
      data: { firstName: 'Sahar', lastName: 'Devjani', username: 'sahar' },
    });
  });

  afterEach(() => localStorage.clear());

  test('loads and updates profile', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const firstName = await screen.findByPlaceholderText(/first name/i);
    expect(firstName).toHaveValue('Sahar');

    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'NewFirst');

    // Button text in your UI is "Save Profile"
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/me$/),
      expect.objectContaining({ firstName: 'NewFirst' }),
      expect.any(Object)
    );
  });

  test('changes password', async () => {
    // Fresh GET for second render
    axios.get.mockResolvedValueOnce({
      data: { firstName: 'Sahar', lastName: 'Devjani', username: 'sahar' },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await screen.findByPlaceholderText(/first name/i);

    // Use exact placeholders to avoid ambiguity with "Confirm New Password"
    await userEvent.type(screen.getByPlaceholderText(/^Old Password$/i), 'old123');
    await userEvent.type(screen.getByPlaceholderText(/^New Password$/i), 'new12345');
    // If your component requires confirm to match, fill it too:
    const confirm = screen.queryByPlaceholderText(/^Confirm New Password$/i);
    if (confirm) {
      await userEvent.type(confirm, 'new12345');
    }

    await userEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/me\/password$/),
      { oldPassword: 'old123', newPassword: 'new12345' },
      expect.any(Object)
    );
  });
});
