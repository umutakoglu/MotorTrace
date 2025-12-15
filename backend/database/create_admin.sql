-- Create admin user with correct bcrypt hash
-- Password: admin123
-- Delete existing admin if any
DELETE FROM users WHERE email = 'admin@motortrace.com';

-- Create admin user
INSERT INTO users (id, username, email, password_hash, role) 
VALUES (
    UUID(),
    'admin',
    'admin@motortrace.com',
    '$2b$10$O6eBGJGCPjgnXnChCE6sGeJHgXFGdfaWOX/WHqPD/G/3ucmE.nzJa',
    'admin'
);

SELECT 'Admin user created successfully!' as message;
