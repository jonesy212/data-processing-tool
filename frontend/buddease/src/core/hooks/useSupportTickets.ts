// useSupportTickets.ts
app/features/support/hooks/useSupportTickets.ts
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import { provideCustomerSupport } from '@/core/state/slices/ApiManagerSlice';
import type { SupportTicket } from '@/core/features/support/SupportTicketComponent';
import { SupportTicketStatus } from '@/core/features/support/SupportTicketComponent';
import { useDispatch, useSelector } from 'react-redux';

export const useSupportTickets = () => {
  const dispatch = useDispatch();
  const tickets = useSelector((state: RootState) => state.apiManager.supportTickets);
  const supportTicketsEnabled = useSelector(
    (state: RootState) => state.userSupportFeedbackPreferences.supportTicketsEnabled
  );

  const createTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
    if (!supportTicketsEnabled) {
      throw new Error('Support tickets are disabled');
    }
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };
    dispatch(provideCustomerSupport(newTicket));
    return newTicket;
  };

  const updateTicket = (ticket: SupportTicket) => {
    dispatch(provideCustomerSupport(ticket));
  };

  const getTicketsByStatus = (status: SupportTicketStatus) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTicketsByPriority = (priority: SupportTicketPriority) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  return {
    tickets,
    createTicket,
    updateTicket,
    getTicketsByStatus,
    getTicketsByPriority
  };
};