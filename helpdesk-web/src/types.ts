export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'
export type TicketPriority = 'Low' | 'Medium' | 'High'

export type TicketStatusValue = TicketStatus | number
export type TicketPriorityValue = TicketPriority | number

export interface TicketResponse {
  id: number
  title: string
  description: string
  status: TicketStatusValue
  priority: TicketPriorityValue
  createdAt: string
  createdByUserId: number
  assignedToUserId: number | null
}

export interface TicketCommentResponse {
  id: number
  ticketId: number
  userId: number
  comment: string
  createdAt: string
}

export interface TicketDetailResponse extends TicketResponse {
  comments: TicketCommentResponse[]
}

export const statusLabels: Record<number, TicketStatus> = {
  0: 'Open',
  1: 'InProgress',
  2: 'Resolved',
  3: 'Closed',
}

export const priorityLabels: Record<number, TicketPriority> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
}

export const statusValueMap: Record<TicketStatus, number> = {
  Open: 0,
  InProgress: 1,
  Resolved: 2,
  Closed: 3,
}

export const priorityValueMap: Record<TicketPriority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
}

export const statusLabel = (value: TicketStatusValue): TicketStatus => {
  if (typeof value === 'string') {
    if (value in statusValueMap) {
      return value as TicketStatus
    }
    const parsed = Number(value)
    return statusLabels[parsed] ?? 'Open'
  }

  return statusLabels[value] ?? 'Open'
}

export const priorityLabel = (value: TicketPriorityValue): TicketPriority => {
  if (typeof value === 'string') {
    if (value in priorityValueMap) {
      return value as TicketPriority
    }
    const parsed = Number(value)
    return priorityLabels[parsed] ?? 'Low'
  }

  return priorityLabels[value] ?? 'Low'
}
