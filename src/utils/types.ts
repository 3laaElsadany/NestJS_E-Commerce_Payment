import { Order } from "./schema/order.schema"
import { User } from "./schema/user.schema"

export type AuthUser = {
  email: string,
  role: string
}

export type AuthResponse = {
  user: User,
  token: string
}

export type FindAllUsersResponse = {
  users: User[],
  count: number
}

export type FindAllOrdersResponse = {
  orders: Order[],
  count: number
}

export type OrderCancelResponse = {
  message: string,
  order: Order
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANGER = 'manager',
}

export type CreatePayment = {
  paymentUrl: string
}

export enum OrderStatus {
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  PROCESSING = 'processing',
  CANCELLED = 'cancelled',
}

export type OrderResponse = {
  message: string,
  order: Order
}
