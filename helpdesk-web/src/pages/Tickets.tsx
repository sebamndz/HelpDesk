import { useEffect, useMemo, useState } from 'react'
import { createTicket, getTickets } from '../api/tickets'
import { Layout } from '../components/Layout'
import { TicketCard } from '../components/TicketCard'
import { useAuth } from '../auth/AuthContext'
import {
  priorityLabel,
  priorityValueMap,
  type TicketPriority,
  type TicketResponse,
} from '../types'

const priorityOptions: TicketPriority[] = ['Low', 'Medium', 'High']

export const Tickets = () => {
  const { roles } = useAuth()
  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('Medium')
  const [submitting, setSubmitting] = useState(false)

  const isRequester = useMemo(() => roles.includes('Requester'), [roles])

  const loadTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTickets()
      setTickets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createTicket({
        title,
        description,
        priority: priorityValueMap[priority],
      })
      setTitle('')
      setDescription('')
      setPriority('Medium')
      await loadTickets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tickets</h1>
            <p className="text-sm text-slate-500">{tickets.length} total</p>
          </div>
          <div className="text-xs text-slate-500">Role: {roles.join(', ') || 'Unknown'}</div>
        </div>

        {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {isRequester ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-semibold">New Ticket</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Priority
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TicketPriority)}
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {priorityLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Description
              <textarea
                className="mt-1 min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>
            <button
              className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Create Ticket'}
            </button>
          </form>
        ) : null}

        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No tickets found.
            </div>
          ) : (
            tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </div>
      </div>
    </Layout>
  )
}
