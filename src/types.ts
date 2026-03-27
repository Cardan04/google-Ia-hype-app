export interface User {
  uid: string;
  name: string;
  email: string;
  walletAddress?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  category: string;
  organizerId: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  status: "valid" | "used" | "cancelled";
  price: number;
  createdAt: string;
}

export interface HypeScore {
  userId: string;
  score: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalEvents: number;
  updatedAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  name: string;
  description: string;
  pointsCost: number;
  isClaimed: boolean;
  createdAt: string;
}

export interface HypeLog {
  id: string;
  userId: string;
  eventId: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface AttendanceToken {
  id: string;
  userId: string;
  eventId: string;
  tokenId: string;
  metadata: any;
  createdAt: string;
}
