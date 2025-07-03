-- Initialize categories
INSERT INTO categories (name, color) VALUES 
('Food', '#ef4444'),
('Transport', '#3b82f6'),
('Entertainment', '#8b5cf6'),
('Shopping', '#f59e0b'),
('Bills', '#10b981'),
('Other', '#6b7280')
ON CONFLICT (name) DO NOTHING;