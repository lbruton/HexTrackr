#!/usr/bin/env node
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hextrackr',
    user: process.env.DB_USER || 'hextrackr',
    password: process.env.DB_PASSWORD || 'hextrackr123',
});

async function importCiscoCSV(csvFilePath) {
    console.log(`📊 Starting import of ${csvFilePath}`);
    
    // Clear existing data
    await pool.query('TRUNCATE TABLE vulnerabilities RESTART IDENTITY CASCADE');
    console.log('🧹 Cleared existing vulnerability data');
    
    const vulnerabilities = [];
    let rowCount = 0;
    
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                rowCount++;
                
                // Map CSV columns to database schema
                const vuln = {
                    advisory_id: row.id || `cisco-${rowCount}`,
                    title: row['definition.name'] || 'Cisco Vulnerability',
                    summary: row['definition.description'] || '',
                    description: row['definition.description'] || '',
                    severity: mapSeverity(row.severity),
                    vpr_score: parseFloat(row['definition.vpr.score']) || parseFloat(row['definition.vpr_v2.score']) || null,
                    cvss_score: null, // Keep separate from VPR
                    cvss_vector: '',
                    cve_ids: row['definition.cve'] ? [row['definition.cve']] : [],
                    affected_products: row['asset.name'] ? [row['asset.name']] : [],
                    cisco_bug_ids: [],
                    publication_date: parseDate(row['definition.vulnerability_published']),
                    last_updated: parseDate(row['definition.plugin_updated']),
                    workarounds: '',
                    fixed_software: [],
                    status: mapStatus(row.state),
                    asset_ip: row['asset.ipv4_addresses'] || row['asset.display_ipv4_address'],
                    asset_name: row['asset.name'], // hostname
                    vendor: row['definition.family'] || 'Cisco'
                };
                
                vulnerabilities.push(vuln);
                
                if (vulnerabilities.length >= 1000) {
                    insertBatch(vulnerabilities.splice(0, 1000));
                }
                
                if (rowCount % 10000 === 0) {
                    console.log(`📈 Processed ${rowCount} rows...`);
                }
            })
            .on('end', async () => {
                // Insert remaining vulnerabilities
                if (vulnerabilities.length > 0) {
                    await insertBatch(vulnerabilities);
                }
                
                console.log(`✅ Import completed! Processed ${rowCount} rows`);
                
                // Get final count
                const result = await pool.query('SELECT COUNT(*) FROM vulnerabilities');
                console.log(`📊 Total vulnerabilities in database: ${result.rows[0].count}`);
                
                await pool.end();
                resolve(rowCount);
            })
            .on('error', reject);
    });
}

async function insertBatch(vulnerabilities) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        for (const vuln of vulnerabilities) {
            await client.query(`
                INSERT INTO vulnerabilities (
                    advisory_id, title, summary, description, severity, vpr_score, cvss_score, 
                    cvss_vector, cve_ids, affected_products, cisco_bug_ids, 
                    publication_date, last_updated, workarounds, fixed_software, status,
                    asset_ip, asset_name, vendor
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                ON CONFLICT (advisory_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    summary = EXCLUDED.summary,
                    description = EXCLUDED.description,
                    severity = EXCLUDED.severity,
                    vpr_score = EXCLUDED.vpr_score,
                    cvss_score = EXCLUDED.cvss_score,
                    asset_ip = EXCLUDED.asset_ip,
                    asset_name = EXCLUDED.asset_name,
                    vendor = EXCLUDED.vendor,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                vuln.advisory_id, vuln.title, vuln.summary, vuln.description,
                vuln.severity, vuln.vpr_score, vuln.cvss_score, vuln.cvss_vector, vuln.cve_ids,
                vuln.affected_products, vuln.cisco_bug_ids, vuln.publication_date,
                vuln.last_updated, vuln.workarounds, vuln.fixed_software, vuln.status,
                vuln.asset_ip, vuln.asset_name, vuln.vendor
            ]);
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

function mapSeverity(severity) {
    if (!severity) return 'Low';
    const sev = severity.toLowerCase();
    if (sev.includes('critical')) return 'Critical';
    if (sev.includes('high')) return 'High';
    if (sev.includes('medium')) return 'Medium';
    if (sev.includes('low')) return 'Low';
    return 'Medium';
}

function mapStatus(state) {
    if (!state) return 'open';
    const s = state.toLowerCase();
    if (s.includes('active')) return 'open';
    if (s.includes('resurfaced')) return 'open';
    if (s.includes('fixed')) return 'closed';
    return 'open';
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toISOString();
    } catch {
        return null;
    }
}

// Run the import
const csvFile = process.argv[2] || './cisco-vulnerabilities-08_19_2025_-09_02_16-cdt.csv';
importCiscoCSV(csvFile)
    .then(count => {
        console.log(`🎉 Successfully imported ${count} vulnerability records`);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    });
