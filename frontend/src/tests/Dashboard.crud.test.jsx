// frontend/src/tests/Dashboard.crud.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
import axios from 'axios';

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem('token', 'dummy');
});

describe('Dashboard CRUD', () => {
  test('loads profile and initial notes, creates a note, edits, then deletes', async () => {
    // GET sequence:
    // 1) /api/auth/me
    // 2) /api/notes (initial)
    // 3) /api/notes (after create)
    // 4) /api/notes (after edit)
    // 5) /api/notes (after delete)
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'Sahar', lastName: 'Devjani', username: 'sahar' } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ _id: '1', title: 'New Note', content: 'Body' }] })
      .mockResolvedValueOnce({ data: [{ _id: '1', title: 'Updated', content: 'c' }] }) // content value here doesn't affect our asserts
      .mockResolvedValueOnce({ data: [] });

    axios.post.mockResolvedValueOnce({ data: { _id: '1' } });
    axios.put.mockResolvedValueOnce({ data: { _id: '1', title: 'Updated', content: 'c' } });
    axios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // header shows user's name
    expect(await screen.findByText(/Sahar Devjani's Notes/i)).toBeInTheDocument();

    // Create note in the create form
    await userEvent.type(screen.getByPlaceholderText(/title/i), 'New Note');
    await userEvent.type(screen.getByTestId('editor'), 'Body');
    await userEvent.click(screen.getByRole('button', { name: /save note/i }));

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/notes$/),
      { title: 'New Note', content: 'Body' },
      expect.any(Object)
    );

    // After refresh we see the new note card
    expect(await screen.findByText(/New Note/i)).toBeInTheDocument();

    // Edit the note: choose the title input that currently shows 'New Note'
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const titleInput = screen.getByDisplayValue('New Note');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    // IMPORTANT: content remains 'Body' (we didn't edit the editor), so expect 'Body'
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/notes\/1$/),
      { title: 'Updated', content: 'Body' },
      expect.any(Object)
    );

    // After refresh we see updated title
    expect(await screen.findByText(/Updated/i)).toBeInTheDocument();

    // Delete note
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/notes\/1$/),
      expect.any(Object)
    );

    await waitFor(() => {
      expect(screen.queryByText(/Updated/i)).not.toBeInTheDocument();
    });
  });
});
