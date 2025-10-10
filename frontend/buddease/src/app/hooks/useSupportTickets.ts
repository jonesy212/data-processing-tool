// useSupportTickets.ts
// app/features/support/hooks/useSupportTickets.ts
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/state/store';
import { provideCustomerSupport } from '@/app/state/slices/ApiManagerSlice';
import { SupportTicket, SupportTicketStatus } from '@/features/support/SupportTicketComponent';

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