-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
    
    -- Company specific fields
    company_name VARCHAR(255),
    vat_number VARCHAR(50),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_date DATE NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    
    -- Invoice details
    subtotal DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
    sent_date DATE,
    paid_date DATE,
    
    -- Company details at time of invoice
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT NOT NULL,
    company_phone VARCHAR(50) NOT NULL,
    company_email VARCHAR(255) NOT NULL,
    company_vat_number VARCHAR(50),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create day_off_periods table
CREATE TABLE IF NOT EXISTS day_off_periods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly')),
    show_banner BOOLEAN DEFAULT TRUE,
    banner_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_log table for dashboard recent activity
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('booking_created', 'booking_updated', 'payment_received', 'invoice_sent', 'customer_added')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('booking', 'payment', 'invoice', 'customer')),
    entity_id UUID NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update bookings table to reference customers
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);

CREATE INDEX IF NOT EXISTS idx_day_off_periods_dates ON day_off_periods(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_off_periods_updated_at BEFORE UPDATE ON day_off_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on day_off_periods" ON day_off_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity_log" ON activity_log FOR ALL USING (true);

-- Create function to automatically create activity log entries
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log booking activities
    IF TG_TABLE_NAME = 'bookings' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
            VALUES (
                'booking_created',
                'booking',
                NEW.id,
                'New booking created for ' || NEW.customer_name,
                jsonb_build_object('service', NEW.service, 'date', NEW.date, 'amount', NEW.amount)
            );
        ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
            INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
            VALUES (
                'booking_updated',
                'booking',
                NEW.id,
                'Booking status changed to ' || NEW.status || ' for ' || NEW.customer_name,
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
            );
        END IF;
    END IF;
    
    -- Log payment activities
    IF TG_TABLE_NAME = 'payments' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
            VALUES (
                'payment_received',
                'payment',
                NEW.id,
                'Payment of £' || NEW.amount || ' received via ' || NEW.payment_method,
                jsonb_build_object('amount', NEW.amount, 'method', NEW.payment_method)
            );
        END IF;
    END IF;
    
    -- Log customer activities
    IF TG_TABLE_NAME = 'customers' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
            VALUES (
                'customer_added',
                'customer',
                NEW.id,
                'New customer added: ' || NEW.name,
                jsonb_build_object('customer_type', NEW.customer_type, 'email', NEW.email)
            );
        END IF;
    END IF;
    
    -- Log invoice activities
    IF TG_TABLE_NAME = 'invoices' THEN
        IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'sent' THEN
            INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
            VALUES (
                'invoice_sent',
                'invoice',
                NEW.id,
                'Invoice ' || NEW.invoice_number || ' sent to customer',
                jsonb_build_object('invoice_number', NEW.invoice_number, 'amount', NEW.total_amount)
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_booking_activity AFTER INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_payment_activity AFTER INSERT ON payments FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_customer_activity AFTER INSERT ON customers FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_invoice_activity AFTER UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Get the highest existing invoice number
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(invoice_number FROM 'IVN-(\d+)') AS INTEGER)), 
        0
    ) + 1 INTO next_number
    FROM invoices 
    WHERE invoice_number ~ '^IVN-\d+$';
    
    -- Format with leading zeros
    formatted_number := 'IVN-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
    (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed' AND date >= CURRENT_DATE - INTERVAL '7 days') as weekly_revenue,
    (SELECT COUNT(DISTINCT customer_id) FROM bookings WHERE customer_id IS NOT NULL) as total_customers,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'pending') as pending_payments; 