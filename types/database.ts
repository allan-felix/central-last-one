export type UserRole = "admin" | "manager" | "cs" | "sales" | "finance" | "viewer";
export type HealthStatus = "healthy" | "attention" | "critical";
export type ClientStatus = "active" | "paused" | "at_risk" | "cancelled";

export interface TenantRecord { id: string; organization_id: string; created_at: string; updated_at: string; }
export interface Client extends TenantRecord { name: string; legal_name: string | null; city: string | null; state: string | null; owner_name: string; manager_id: string | null; plan_id: string | null; monthly_fee: number; joined_at: string; renewal_at: string; health_score: number; status: ClientStatus; }
export interface HealthScore extends TenantRecord { client_id: string; total_score: number; campaign_performance: number; meeting_frequency: number; client_engagement: number; payment_status: number; response_time: number; satisfaction: number; calculated_at: string; }
