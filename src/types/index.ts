export const TOPICS = [
  "Work & Career",
  "Love & Relationships",
  "Family & Kids",
  "Personal Growth",
  "Confidence",
  "Health & Wellness",
  "Goals & Success",
  "Peace & Mindfulness",
  "Surprise Me",
] as const;

export type Topic = (typeof TOPICS)[number];

export type DeliveryStatus = "pending" | "sent" | "failed";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  topics: Topic[];
  deliveryTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  topic: string;
  deliveryStatus: DeliveryStatus;
  generatedAt: Date;
  sentAt: Date | null;
}

export interface SignupInput {
  email: string;
  name?: string;
  topics: Topic[];
  deliveryTime: string;
}

export interface PreferenceUpdate {
  topics?: Topic[];
  deliveryTime?: string;
}
