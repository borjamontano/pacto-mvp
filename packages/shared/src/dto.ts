import { PactStatus } from "./types";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type HouseholdCreateRequest = {
  name: string;
};

export type JoinHouseholdRequest = {
  inviteCode: string;
};

export type PactCreateRequest = {
  title: string;
  notes?: string | null;
  assignedToUserId?: string | null;
  dueAt?: string | null;
  requiresConfirmation?: boolean;
};

export type PactUpdateRequest = {
  title?: string;
  notes?: string | null;
  assignedToUserId?: string | null;
  dueAt?: string | null;
  status?: PactStatus;
  requiresConfirmation?: boolean;
};

export type DeviceRegisterRequest = {
  expoPushToken: string;
  platform: "ios" | "android";
};
