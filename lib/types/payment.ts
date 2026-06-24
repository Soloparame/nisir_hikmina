import type { Appointment } from "./doctor";

export type PaymentMethod = "telebirr" | "cbe";
export type PaymentStatus = "pending_review" | "approved" | "rejected";

export type AppointmentPayment = {
  id: string;
  appointment_id: string;
  method: PaymentMethod;
  amount_etb: number;
  screenshot_url: string;
  status: PaymentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
};

export type BookingWithPayment = Appointment & {
  payment?: AppointmentPayment | null;
  doctor_name?: string | null;
};

export type BookingPaymentInsert = {
  doctor_id: string;
  patient_name: string;
  phone: string;
  disease: string;
  telegram?: string;
  country: string;
  city: string;
  consult_type: string;
  consult_type_key: "text" | "audio" | "video";
  user_id?: string;
  availability_period?: string;
  availability_time?: string;
  scheduled_date: string;
  scheduled_time: string;
  amount_etb: number;
  payment_method: PaymentMethod;
  screenshot_url: string;
};
