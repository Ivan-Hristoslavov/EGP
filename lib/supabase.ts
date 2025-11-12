import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin operations (uses service role key, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types for our database
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          customer_type: "individual" | "company";
          company_name: string | null;
          vat_number: string | null;
          contact_person: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          customer_type?: "individual" | "company";
          company_name?: string | null;
          vat_number?: string | null;
          contact_person?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          customer_type?: "individual" | "company";
          company_name?: string | null;
          vat_number?: string | null;
          contact_person?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          amount: number;
          payment_method: "cash" | "card" | "bank_transfer" | "cheque";
          payment_status: "pending" | "paid" | "refunded" | "failed";
          payment_date: string;
          reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          customer_id?: string | null;
          amount: number;
          payment_method?: "cash" | "card" | "bank_transfer" | "cheque";
          payment_status?: "pending" | "paid" | "refunded" | "failed";
          payment_date: string;
          reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          customer_id?: string | null;
          amount?: number;
          payment_method?: "cash" | "card" | "bank_transfer" | "cheque";
          payment_status?: "pending" | "paid" | "refunded" | "failed";
          payment_date?: string;
          reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          invoice_number: string;
          invoice_date: string;
          due_date: string | null;
          subtotal: number;
          vat_rate: number;
          vat_amount: number;
          total_amount: number;
          status: "pending" | "sent" | "paid" | "overdue" | "cancelled";
          sent_date: string | null;
          paid_date: string | null;
          company_name: string;
          company_address: string;
          company_phone: string;
          company_email: string;
          company_vat_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          customer_id?: string | null;
          invoice_number: string;
          invoice_date: string;
          due_date?: string | null;
          subtotal: number;
          vat_rate?: number;
          vat_amount: number;
          total_amount: number;
          status?: "pending" | "sent" | "paid" | "overdue" | "cancelled";
          sent_date?: string | null;
          paid_date?: string | null;
          company_name: string;
          company_address: string;
          company_phone: string;
          company_email: string;
          company_vat_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          customer_id?: string | null;
          invoice_number?: string;
          invoice_date?: string;
          due_date?: string | null;
          subtotal?: number;
          vat_rate?: number;
          vat_amount?: number;
          total_amount?: number;
          status?: "pending" | "sent" | "paid" | "overdue" | "cancelled";
          sent_date?: string | null;
          paid_date?: string | null;
          company_name?: string;
          company_address?: string;
          company_phone?: string;
          company_email?: string;
          company_vat_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      day_off_periods: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          is_recurring: boolean;
          recurrence_type: "weekly" | "monthly" | "yearly" | null;
          show_banner: boolean;
          banner_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          is_recurring?: boolean;
          recurrence_type?: "weekly" | "monthly" | "yearly" | null;
          show_banner?: boolean;
          banner_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          is_recurring?: boolean;
          recurrence_type?: "weekly" | "monthly" | "yearly" | null;
          show_banner?: boolean;
          banner_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          activity_type:
            | "booking_created"
            | "booking_updated"
            | "payment_received"
            | "invoice_sent"
            | "customer_added";
          entity_type: "booking" | "payment" | "invoice" | "customer";
          entity_id: string;
          message: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_type:
            | "booking_created"
            | "booking_updated"
            | "payment_received"
            | "invoice_sent"
            | "customer_added";
          entity_type: "booking" | "payment" | "invoice" | "customer";
          entity_id: string;
          message: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_type?:
            | "booking_created"
            | "booking_updated"
            | "payment_received"
            | "invoice_sent"
            | "customer_added";
          entity_type?: "booking" | "payment" | "invoice" | "customer";
          entity_id?: string;
          message?: string;
          metadata?: any;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          service: string;
          date: string;
          time: string;
          status: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed";
          payment_status: "pending" | "paid" | "refunded";
          amount: number;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          service: string;
          date: string;
          time: string;
          status?: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed";
          payment_status?: "pending" | "paid" | "refunded";
          amount: number;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          service?: string;
          date?: string;
          time?: string;
          status?: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed";
          payment_status?: "pending" | "paid" | "refunded";
          amount?: number;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_profile: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          password: string;
          company_name: string | null;
          company_address: string | null;
          about: string | null;
          bank_name: string | null;
          account_number: string | null;
          sort_code: string | null;
          gas_safe_number: string | null;
          insurance_provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          password: string;
          company_name?: string | null;
          company_address?: string | null;
          about?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          sort_code?: string | null;
          gas_safe_number?: string | null;
          insurance_provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          password?: string;
          company_name?: string | null;
          company_address?: string | null;
          about?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          sort_code?: string | null;
          gas_safe_number?: string | null;
          insurance_provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      working_hours: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working_day: boolean;
          buffer_minutes: number;
          max_appointments: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working_day?: boolean;
          buffer_minutes?: number;
          max_appointments?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_working_day?: boolean;
          buffer_minutes?: number;
          max_appointments?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_durations: {
        Row: {
          id: string;
          service_name: string;
          duration_minutes: number;
          buffer_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_name: string;
          duration_minutes: number;
          buffer_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_name?: string;
          duration_minutes?: number;
          buffer_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          booking_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
