import { Link } from 'react-router-dom'
import { priorityLabel } from '../types'
import type { TicketResponse } from '../types'
import { StatusBadge } from './StatusBadge'

interface TicketCardProps {
  ticket: TicketResponse
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-1 text-sm text-slate-500">Priority: {priorityLabel(ticket.priority)}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        <span>
          Assigned:{' '}
          {ticket.assignedToUserId !== null ? ticket.assignedToUserId : 'Unassigned'}
        </span>
      </div>
    </Link>
  )
}
