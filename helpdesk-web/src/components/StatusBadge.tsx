import { statusLabel } from '../types'
import type { TicketStatusValue } from '../types'

const statusStyles: Record<string, string> = {
  Open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  InProgress: 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-blue-50 text-blue-700 border-blue-200',
  Closed: 'bg-slate-200 text-slate-700 border-slate-300',
}

export const StatusBadge = ({ status }: { status: TicketStatusValue }) => {
  const label = statusLabel(status)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        statusStyles[label]
      }`}
    >
      {label}
    </span>
  )
}
