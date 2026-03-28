export type UserRole = "donor" | "hospital";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type Coordinates = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export type AppUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  bloodType?: BloodType;
  facility?: string;
  availability: boolean;
  location?: Coordinates;
};

export type EmergencyRequest = {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: BloodType;
  urgency: UrgencyLevel;
  status: "open" | "fulfilled";
  location?: Coordinates;
  matchedDonorIds: string[];
  matchedCount: number;
  responderIds: string[];
  createdAt: string;
  suggestedTransportAmount: number;
};

export type PaymentRecord = {
  id: string;
  requestId: string;
  donorId: string;
  phone: string;
  amount: number;
  transactionId: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseDescription?: string;
  createdAt: string;
};
