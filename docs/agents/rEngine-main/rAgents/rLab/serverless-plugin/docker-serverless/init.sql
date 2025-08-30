-- Initialize StackTrackr Prices Database

-- Create price snapshots table
CREATE TABLE IF NOT EXISTS price_snapshots (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL,
    metal VARCHAR(20) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'toz',
    price DECIMAL(12,6) NOT NULL,
    ask DECIMAL(12,6),
    bid DECIMAL(12,6),
    high24h DECIMAL(12,6),
    low24h DECIMAL(12,6),
    change_amount DECIMAL(12,6),
    change_percent DECIMAL(8,4),
    provider VARCHAR(50) NOT NULL,
    source VARCHAR(20) DEFAULT 'spot',
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(ts, metal, currency, unit, provider)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_price_snapshots_metal_currency_ts 
    ON price_snapshots(metal, currency, ts DESC);
    
CREATE INDEX IF NOT EXISTS idx_price_snapshots_provider_ts 
    ON price_snapshots(provider, ts DESC);
    
CREATE INDEX IF NOT EXISTS idx_price_snapshots_ts 
    ON price_snapshots(ts DESC);

-- Create latest prices view for quick access
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (metal, currency, unit, provider)
    metal, currency, unit, price, ask, bid, 
    high24h, low24h, change_amount, change_percent,
    provider, source, ts, created_at
FROM price_snapshots
ORDER BY metal, currency, unit, provider, ts DESC;

-- Create provider status table for monitoring
CREATE TABLE IF NOT EXISTS provider_status (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- healthy, degraded, down
    last_successful_fetch TIMESTAMPTZ,
    last_error_message TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial provider status
INSERT INTO provider_status (provider, status) 
VALUES ('metals.dev', 'unknown')
ON CONFLICT DO NOTHING;

-- Create configuration table
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO config (key, value, description) VALUES
    ('providers', '{"metals.dev": {"enabled": true, "timeoutMs": 5000}}', 'Provider configuration'),
    ('cache', '{"ttlSeconds": 300, "enableHysteresis": true}', 'Cache settings'),
    ('limits', '{"requestsPerIpPerMinute": 60}', 'Rate limiting settings')
ON CONFLICT (key) DO NOTHING;

-- Create function to update provider status
CREATE OR REPLACE FUNCTION update_provider_status(
    p_provider VARCHAR(50),
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO provider_status (provider, status, last_error_message, consecutive_failures)
    VALUES (
        p_provider, 
        p_status, 
        p_error_message,
        CASE WHEN p_status = 'healthy' THEN 0 ELSE 1 END
    )
    ON CONFLICT (provider) DO UPDATE SET
        status = EXCLUDED.status,
        last_successful_fetch = CASE 
            WHEN EXCLUDED.status = 'healthy' THEN NOW() 
            ELSE provider_status.last_successful_fetch 
        END,
        last_error_message = EXCLUDED.last_error_message,
        consecutive_failures = CASE 
            WHEN EXCLUDED.status = 'healthy' THEN 0
            ELSE provider_status.consecutive_failures + 1
        END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create cleanup function for old data
CREATE OR REPLACE FUNCTION cleanup_old_price_data(days_to_keep INTEGER DEFAULT 365) 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM price_snapshots 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO stacktrackr;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO stacktrackr;
