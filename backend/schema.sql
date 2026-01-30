-- G-ZIP Database Schema
-- PostgreSQL 15+ with PostGIS Extension
-- ==========================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 1. Regions (Counties/Districts)
-- ==========================================
-- Stores county/district boundaries with pre-calculated friction scores

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fips_code VARCHAR(10) UNIQUE,
    state VARCHAR(2) NOT NULL,
    
    -- Friction Score Components (PRD spec)
    zoning_strictness VARCHAR(20) CHECK (zoning_strictness IN ('by-right', 'conditional', 'moratorium')),
    community_sentiment VARCHAR(20) CHECK (community_sentiment IN ('welcoming', 'neutral', 'hostile')),
    tax_status VARCHAR(20) CHECK (tax_status IN ('abatement', 'standard', 'high')),
    union_labor_req BOOLEAN DEFAULT FALSE,
    tax_rate_commercial DECIMAL(5,4),
    
    -- Pre-calculated friction score (0-100)
    friction_score INT CHECK (friction_score >= 0 AND friction_score <= 100),
    
    -- Economic incentives (JSONB for flexibility)
    incentives JSONB DEFAULT '{}',
    -- Example: {"tax_break": true, "type": "overlay", "expedited_permits": true}
    
    -- Geometry (MultiPolygon for county boundaries)
    geom GEOMETRY(MULTIPOLYGON, 4326),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for region geometry
CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_regions_fips ON regions (fips_code);
CREATE INDEX IF NOT EXISTS idx_regions_friction ON regions (friction_score);


-- ==========================================
-- 2. Grid Infrastructure (Transmission Lines)
-- ==========================================
-- Stores high-voltage transmission lines (>=230kV per PRD spec)

CREATE TABLE IF NOT EXISTS grid_lines (
    id SERIAL PRIMARY KEY,
    hifld_id VARCHAR(50),  -- Original HIFLD OBJECTID
    
    -- Voltage info (PRD spec: 230kV+ only)
    voltage_kv INT NOT NULL CHECK (voltage_kv >= 230),
    volt_class VARCHAR(20),  -- e.g., '220-287', '345', '500', '735 AND ABOVE'
    
    -- Status and ownership
    status VARCHAR(20) DEFAULT 'IN SERVICE',
    owner VARCHAR(100),
    line_type VARCHAR(50),  -- AC, DC, etc.
    
    -- Geometry (LineString for transmission lines)
    geom GEOMETRY(LINESTRING, 4326),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for grid lines
CREATE INDEX IF NOT EXISTS idx_grid_lines_geom ON grid_lines USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_grid_lines_voltage ON grid_lines (voltage_kv);


-- ==========================================
-- 3. Data Center Clusters (Existing Facilities)
-- ==========================================
-- Stores existing data center locations and estimated load

CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    -- Capacity and load estimates
    est_load_mw INT,
    total_capacity_mw INT,
    
    -- Operator info
    operator VARCHAR(100),  -- e.g., "QTS", "Digital Realty", "Equinix"
    
    -- Location details
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    region_id INT REFERENCES regions(id),
    
    -- Geometry (Point for data center location)
    geom GEOMETRY(POINT, 4326),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for clusters
CREATE INDEX IF NOT EXISTS idx_clusters_geom ON clusters USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_clusters_operator ON clusters (operator);


-- ==========================================
-- 4. Opportunity Zones (Federal)
-- ==========================================
-- Census tract-based Opportunity Zones

CREATE TABLE IF NOT EXISTS opportunity_zones (
    id SERIAL PRIMARY KEY,
    tract_id VARCHAR(20) UNIQUE NOT NULL,  -- Census tract ID
    name VARCHAR(100),
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    
    -- Zone status
    designation_date DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Geometry (MultiPolygon for census tract boundaries)
    geom GEOMETRY(MULTIPOLYGON, 4326),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for opportunity zones
CREATE INDEX IF NOT EXISTS idx_oz_geom ON opportunity_zones USING GIST (geom);


-- ==========================================
-- 5. Data Center Overlay Districts
-- ==========================================
-- Local jurisdictions with special DC zoning (PRD MVP markets)

CREATE TABLE IF NOT EXISTS overlay_districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    -- Location
    county VARCHAR(100),
    state VARCHAR(2) NOT NULL,
    
    -- District type
    district_type VARCHAR(50) DEFAULT 'overlay',
    
    -- Incentives (JSONB for flexibility)
    incentives JSONB DEFAULT '{}',
    -- Example: {"tax_break": true, "expedited_permits": true, "by_right_approval": true}
    
    -- Pre-calculated friction attributes
    zoning_strictness VARCHAR(20),
    community_sentiment VARCHAR(20),
    tax_status VARCHAR(20),
    
    -- Geometry (MultiPolygon for district boundaries)
    geom GEOMETRY(MULTIPOLYGON, 4326),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for overlay districts
CREATE INDEX IF NOT EXISTS idx_overlay_geom ON overlay_districts USING GIST (geom);


-- ==========================================
-- 6. LMP Nodes (Capacity Proxy)
-- ==========================================
-- Locational Marginal Pricing nodes as capacity availability proxy

CREATE TABLE IF NOT EXISTS lmp_nodes (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    
    -- Pricing data (low LMP = available capacity)
    avg_lmp DECIMAL(10,2),  -- $/MWh
    peak_lmp DECIMAL(10,2),
    off_peak_lmp DECIMAL(10,2),
    
    -- Capacity indicators
    congestion_flag BOOLEAN DEFAULT FALSE,
    capacity_available_mw INT,
    
    -- ISO/RTO
    iso_rto VARCHAR(20),  -- 'ERCOT', 'PJM', 'MISO', 'SPP'
    
    -- Geometry (Point)
    geom GEOMETRY(POINT, 4326),
    
    -- Data timestamp
    data_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for LMP nodes
CREATE INDEX IF NOT EXISTS idx_lmp_geom ON lmp_nodes USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_lmp_iso ON lmp_nodes (iso_rto);


-- ==========================================
-- Views for Common Queries
-- ==========================================

-- Sweet Spot Sites View (friction_score <= 20)
CREATE OR REPLACE VIEW v_sweet_spots AS
SELECT 
    r.id,
    r.name,
    r.state,
    r.fips_code,
    r.friction_score,
    r.incentives,
    r.geom,
    COUNT(DISTINCT gl.id) as nearby_grid_lines,
    COUNT(DISTINCT oz.id) as opportunity_zones,
    COUNT(DISTINCT od.id) as overlay_districts
FROM regions r
LEFT JOIN grid_lines gl ON ST_DWithin(r.geom::geography, gl.geom::geography, 8046.72)  -- 5 miles
LEFT JOIN opportunity_zones oz ON ST_Intersects(r.geom, oz.geom)
LEFT JOIN overlay_districts od ON ST_Intersects(r.geom, od.geom)
WHERE r.friction_score <= 20
GROUP BY r.id;


-- Grid Proximity Analysis View
CREATE OR REPLACE VIEW v_grid_proximity AS
SELECT 
    r.id as region_id,
    r.name as region_name,
    r.friction_score,
    gl.id as grid_line_id,
    gl.voltage_kv,
    ST_Distance(r.geom::geography, gl.geom::geography) / 1609.34 as distance_miles
FROM regions r
CROSS JOIN LATERAL (
    SELECT g.id, g.voltage_kv, g.geom
    FROM grid_lines g
    WHERE ST_DWithin(r.geom::geography, g.geom::geography, 16093.4)  -- 10 miles
    ORDER BY r.geom <-> g.geom
    LIMIT 5
) gl;


-- ==========================================
-- Seed Data for MVP Markets (PRD spec)
-- ==========================================

-- Insert MVP overlay districts
INSERT INTO overlay_districts (name, county, state, district_type, incentives, zoning_strictness, community_sentiment, tax_status, geom)
VALUES 
    ('Data Center Alley', 'Loudoun County', 'VA', 'overlay', 
     '{"tax_break": true, "expedited_permits": true, "by_right_approval": true}',
     'by-right', 'welcoming', 'abatement',
     ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-77.7 38.85, -77.3 38.85, -77.3 39.15, -77.7 39.15, -77.7 38.85)')), 4326)),
    
    ('Digital Gateway', 'Prince William County', 'VA', 'overlay',
     '{"tax_break": true, "expedited_permits": true, "by_right_approval": true}',
     'by-right', 'welcoming', 'abatement',
     ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-77.7 38.55, -77.3 38.55, -77.3 38.85, -77.7 38.85, -77.7 38.55)')), 4326)),
    
    ('Critical Digital Infrastructure Zone', 'Frederick County', 'MD', 'overlay',
     '{"tax_break": true, "expedited_permits": false}',
     'conditional', 'neutral', 'standard',
     ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-77.6 39.3, -77.2 39.3, -77.2 39.7, -77.6 39.7, -77.6 39.3)')), 4326))
ON CONFLICT DO NOTHING;


-- ==========================================
-- Functions
-- ==========================================

-- Calculate friction score from attributes
CREATE OR REPLACE FUNCTION calculate_friction_score(
    p_zoning VARCHAR(20),
    p_sentiment VARCHAR(20),
    p_tax VARCHAR(20)
) RETURNS INT AS $$
DECLARE
    v_zoning_score INT;
    v_sentiment_score INT;
    v_tax_score INT;
    v_total DECIMAL;
BEGIN
    -- Zoning score (40% weight)
    v_zoning_score := CASE p_zoning
        WHEN 'by-right' THEN 0
        WHEN 'conditional' THEN 20
        WHEN 'moratorium' THEN 40
        ELSE 20
    END;
    
    -- Sentiment score (30% weight)
    v_sentiment_score := CASE p_sentiment
        WHEN 'welcoming' THEN 0
        WHEN 'neutral' THEN 15
        WHEN 'hostile' THEN 30
        ELSE 15
    END;
    
    -- Tax score (30% weight)
    v_tax_score := CASE p_tax
        WHEN 'abatement' THEN 0
        WHEN 'standard' THEN 15
        WHEN 'high' THEN 30
        ELSE 15
    END;
    
    -- Calculate weighted total and normalize to 0-100
    v_total := (v_zoning_score * 0.40 + v_sentiment_score * 0.30 + v_tax_score * 0.30) * (100.0 / 34.0);
    
    RETURN LEAST(100, GREATEST(0, ROUND(v_total)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Trigger to auto-calculate friction score on insert/update
CREATE OR REPLACE FUNCTION update_friction_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.friction_score := calculate_friction_score(
        NEW.zoning_strictness,
        NEW.community_sentiment,
        NEW.tax_status
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_regions_friction_score
    BEFORE INSERT OR UPDATE OF zoning_strictness, community_sentiment, tax_status
    ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_friction_score();


-- Find optimal sites within distance of grid infrastructure
CREATE OR REPLACE FUNCTION find_sweet_spots(
    p_max_friction_score INT DEFAULT 40,
    p_max_distance_miles DECIMAL DEFAULT 5.0,
    p_min_voltage INT DEFAULT 230
) RETURNS TABLE (
    region_id INT,
    region_name VARCHAR,
    state VARCHAR,
    friction_score INT,
    nearest_line_voltage INT,
    distance_miles DECIMAL,
    has_opportunity_zone BOOLEAN,
    has_overlay_district BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (r.id)
        r.id,
        r.name,
        r.state,
        r.friction_score,
        gl.voltage_kv,
        ROUND((ST_Distance(r.geom::geography, gl.geom::geography) / 1609.34)::numeric, 2),
        EXISTS(SELECT 1 FROM opportunity_zones oz WHERE ST_Intersects(r.geom, oz.geom)),
        EXISTS(SELECT 1 FROM overlay_districts od WHERE ST_Intersects(r.geom, od.geom))
    FROM regions r
    JOIN grid_lines gl ON ST_DWithin(r.geom::geography, gl.geom::geography, p_max_distance_miles * 1609.34)
    WHERE r.friction_score <= p_max_friction_score
      AND gl.voltage_kv >= p_min_voltage
    ORDER BY r.id, ST_Distance(r.geom::geography, gl.geom::geography);
END;
$$ LANGUAGE plpgsql;
