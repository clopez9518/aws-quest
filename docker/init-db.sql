-- AWS Architecture Quest - Database Initialization Script
-- Habilita extensiones criptográficas y soporte de UUIDs nativos

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
