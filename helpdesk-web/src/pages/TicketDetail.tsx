import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addComment, getTicket, updateAssignment, updateStatus } from '../api/tickets'
import { Layout } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import {
  priorityLabel,
  statusLabel,
  statusValueMap,
  type TicketDetailResponse,
  type TicketStatus,
} from '../types'

const statusOptions: TicketStatus[] = ['Open', 'InProgress', 'Resolved', 'Closed']

export const TicketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { roles } = useAuth()
  const [ticket, setTicket] = useState<TicketDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignedToUserId, setAssignedToUserId] = useState<string>('')

  const canManage = useMemo(
    () => roles.includes('Admin') || roles.includes('Agent'),
    [roles],
  )

  const ticketId = Number(id)

  const loadTicket = async () => {
    if (Number.isNaN(ticketId)) {
      setError('Invalid ticket id.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getTicket(ticketId)
      setTicket(data)
      setAssignedToUserId(
        data.assignedToUserId !== null ? String(data.assignedToUserId) : '',
      )
    } catch (err) {
      if (err instanceof Error) {
        if ('status' in err && (err as { status?: number }).status === 403) {
          setError('You do not have access to this ticket.')
        } else if ('status' in err && (err as { status?: number }).status === 404) {
          setError('Ticket not found.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to load ticket')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) return

    setCommentLoading(true)
    try {
      await addComment(ticketId, { comment })
      setComment('')
      await loadTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ticket) return
    const nextStatus = event.target.value as TicketStatus

    setStatusUpdating(true)
    try {
      await updateStatus(ticketId, statusValueMap[nextStatus])
      await loadTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleAssign = async (event: React.FormEvent) => {
    event.preventDefault()

    setAssignLoading(true)
    try {
      const parsed = assignedToUserId.trim() === '' ? null : Number(assignedToUserId)
      await updateAssignment(ticketId, Number.isNaN(parsed) ? null : parsed)
      await loadTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment')
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <button
          type="button"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
          onClick={() => navigate('/tickets')}
        >
          ← Back to tickets
        </button>

        {loading ? (
          <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Loading ticket...
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : ticket ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{ticket.title}</h1>
                  <p className="mt-2 text-sm text-slate-500">{ticket.description}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <div>Status: {statusLabel(ticket.status)}</div>
                <div>Priority: {priorityLabel(ticket.priority)}</div>
                <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
                <div>Created By: {ticket.createdByUserId}</div>
                <div>
                  Assigned To:{' '}
                  {ticket.assignedToUserId !== null ? ticket.assignedToUserId : 'Unassigned'}
                </div>
              </div>
            </div>

            {canManage ? (
              <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Update Status
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={statusLabel(ticket.status)}
                    onChange={handleStatusChange}
                    disabled={statusUpdating}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <form onSubmit={handleAssign} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Assign User ID
                    <input
                      className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      type="number"
                      value={assignedToUserId}
                      onChange={(event) => setAssignedToUserId(event.target.value)}
                      placeholder="Leave blank to unassign"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={assignLoading}
                  >
                    {assignLoading ? 'Saving...' : 'Update Assignment'}
                  </button>
                </form>
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Comments</h2>
              <div className="mt-4 space-y-3">
                {ticket.comments.length === 0 ? (
                  <p className="text-sm text-slate-500">No comments yet.</p>
                ) : (
                  ticket.comments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-sm text-slate-700">{item.comment}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        User {item.userId} • {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Add Comment
                  <textarea
                    className="mt-2 min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
