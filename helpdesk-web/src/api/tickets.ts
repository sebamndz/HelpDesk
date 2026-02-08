import { request } from './http'
import type {
  TicketDetailResponse,
  TicketResponse,
  TicketStatusValue,
  TicketPriorityValue,
} from '../types'

export interface CreateTicketPayload {
  title: string
  description: string
  priority: TicketPriorityValue
}

export interface AddCommentPayload {
  comment: string
}

export const getTickets = () => request<TicketResponse[]>('/tickets')

export const getTicket = (id: number) => request<TicketDetailResponse>(`/tickets/${id}`)

export const createTicket = (payload: CreateTicketPayload) =>
  request<TicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const addComment = (id: number, payload: AddCommentPayload) =>
  request<void>(`/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateStatus = (id: number, status: TicketStatusValue) =>
  request<void>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const updateAssignment = (id: number, assignedToUserId: number | null) =>
  request<void>(`/tickets/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToUserId }),
  })
