import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import CourseTabs from './CourseTabs';

const preloadedState = {
  courseTabs: {
    tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
    active: 0
  }
};

vi.mock('components/DraggableTab', () => ({
  default: ({ tabName }: { tabName: string }) => <div>{tabName}</div>
}));

describe('CourseTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<CourseTabs />, { preloadedState });
    expect(screen.getByText('Show all courses')).toBeInTheDocument();
    expect(screen.getByRole('switch').ariaChecked).toBeFalsy();
    await waitFor(() => expect(screen.getByText('COMP1511')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('COMP1521')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('COMP1531')).toBeInTheDocument());
  });

  it('should remove all tabs', async () => {
    renderWithProviders(<CourseTabs />, { preloadedState });
    await userEvent.click(screen.getByTestId('delete-tabs'));
    await userEvent.click(screen.getByText('Yes'));
    expect(screen.queryByTestId('delete-tabs')).not.toBeInTheDocument();
  });
});
