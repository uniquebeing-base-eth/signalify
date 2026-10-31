export type WorkspaceRole = "owner" | "admin" | "member";
export type EmployeeStatus = "active" | "idle" | "offline" | "training";
export type TaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type ModelCapability = {
  name: string;
  supported: boolean;
};

export type ModelRecord = {
  id: string;
  name: string;
  provider: string;
  modelType?: string;
  contextLength?: number;
  maxOutputTokens?: number;
  supportedProtocols?: string[];
  capabilities?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  available?: boolean;
  providerAvailability?: string;
};

export type EmployeeRecord = {
  id: string;
  name: string;
  title: string;
  employeeId: string;
  profession: string;
  specialization?: string;
  description?: string;
  status: EmployeeStatus;
  modelName: string;
  modelProvider: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  employeeName?: string;
  createdAt: string;
};
