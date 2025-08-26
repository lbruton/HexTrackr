#!/usr/bin/env python3
"""
Generate Large Sample Vulnerability Data
Generates a ~60MB CSV file with random dates for HexTrackr testing
"""

import csv
import random
import sys
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

# Base data templates from the sample file
SAMPLE_VULNERABILITIES = [
    {
        "definition.cve": "CVE-2024-1234",
        "definition.description": "Cisco IOS XE Software Command Injection - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco IOS XE Command Injection",
        "definition.vpr.score": 7.5,
        "port": 22,
        "protocol": "TCP",
        "severity": "High"
    },
    {
        "definition.cve": "CVE-2024-5678", 
        "definition.description": "Cisco Switch SNMP Vulnerability - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco SNMP Information Disclosure",
        "definition.vpr.score": 5.3,
        "port": 161,
        "protocol": "UDP",
        "severity": "Medium"
    },
    {
        "definition.cve": "CVE-2024-9012",
        "definition.description": "Cisco Router BGP Vulnerability - Test Description", 
        "definition.family": "Cisco",
        "definition.name": "Cisco BGP Route Leak",
        "definition.vpr.score": 6.8,
        "port": 179,
        "protocol": "TCP",
        "severity": "Medium"
    },
    {
        "definition.cve": "CVE-2024-3456",
        "definition.description": "Cisco ASA Firewall DoS Vulnerability - Test Description",
        "definition.family": "Cisco", 
        "definition.name": "Cisco ASA Denial of Service",
        "definition.vpr.score": 4.2,
        "port": 443,
        "protocol": "TCP",
        "severity": "Low"
    },
    {
        "definition.cve": "CVE-2024-7890",
        "definition.description": "Cisco Catalyst Stack Vulnerability - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco Catalyst Stack Manager", 
        "definition.vpr.score": 8.1,
        "port": 80,
        "protocol": "TCP",
        "severity": "Critical"
    },
    {
        "definition.cve": "CVE-2024-2468",
        "definition.description": "Cisco Wireless Controller Auth Bypass - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco WLC Authentication Bypass",
        "definition.vpr.score": 9.2,
        "port": 8443,
        "protocol": "TCP", 
        "severity": "Critical"
    },
    {
        "definition.cve": "CVE-2024-1357",
        "definition.description": "Cisco IOS Interface Overflow - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco IOS Interface Buffer Overflow",
        "definition.vpr.score": 6.3,
        "port": 23,
        "protocol": "TCP",
        "severity": "Medium"
    },
    {
        "definition.cve": "CVE-2024-9753",
        "definition.description": "Cisco Switch Management Exposure - Test Description",
        "definition.family": "Cisco",
        "definition.name": "Cisco Switch Management Interface",
        "definition.vpr.score": 5.7,
        "port": 443,
        "protocol": "TCP",
        "severity": "Medium"
    }
]

# Device name templates
DEVICE_TEMPLATES = [
    "SW-CORE-{:02d}", "SW-ACCESS-{:02d}", "SW-DIST-{:02d}", "SW-MGMT-{:02d}",
    "RTR-EDGE-{:02d}", "RTR-WAN-{:02d}", "RTR-CORE-{:02d}",
    "FW-DMZ-{:02d}", "FW-MAIN-{:02d}", "FW-GUEST-{:02d}",
    "AP-WIFI-{:02d}", "AP-GUEST-{:02d}",
    "SRV-WEB-{:02d}", "SRV-DB-{:02d}", "SRV-APP-{:02d}"
]

# Network subnets for realistic IP generation
SUBNETS = [
    "192.168.1", "192.168.2", "192.168.10", "192.168.20",
    "10.0.1", "10.0.10", "10.1.1", "10.10.1",
    "172.16.1", "172.16.10", "172.20.1"
]

def generate_random_date_range():
    """Generate a 6-month date range ending on current date (Aug 25, 2025)"""
    end_date = datetime(2025, 8, 25)
    start_date = end_date - timedelta(days=180)  # 6 months back
    return start_date, end_date

def random_date_in_range(start_date, end_date):
    """Generate a random datetime within the given range"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    random_hours = random.randrange(24)
    random_minutes = random.randrange(60)
    
    return start_date + timedelta(days=random_days, hours=random_hours, minutes=random_minutes)

def generate_ip_address(subnet):
    """Generate a random IP address in the given subnet"""
    return f"{subnet}.{random.randint(100, 254)}"

def generate_multiple_ips():
    """Occasionally generate multiple IP addresses (like in sample data)"""
    if random.random() < 0.3:  # 30% chance of multiple IPs
        subnet = random.choice(SUBNETS)
        num_ips = random.randint(2, 3)
        return ", ".join([generate_ip_address(subnet) for _ in range(num_ips)])
    else:
        return generate_ip_address(random.choice(SUBNETS))

def generate_vulnerability_record(vuln_template, record_id, start_date, end_date):
    """Generate a single vulnerability record"""
    
    # Generate base dates
    scan_date = random_date_in_range(start_date, end_date)
    vuln_published = scan_date - timedelta(days=random.randint(30, 365))
    plugin_updated = vuln_published + timedelta(days=random.randint(1, 30))
    resurfaced_date = scan_date - timedelta(days=random.randint(1, 15))
    
    # Calculate age
    age_days = (scan_date - vuln_published).days
    vuln_age = age_days
    
    # SLA date (30-90 days from scan)
    sla_date = scan_date + timedelta(days=random.randint(30, 90))
    
    # Generate device info
    device_template = random.choice(DEVICE_TEMPLATES)
    device_number = random.randint(1, 50)
    device_name = device_template.format(device_number)
    
    # Generate IPs
    ip_addresses = generate_multiple_ips()
    
    # Asset ID (realistic GUID-like)
    asset_id = f"host{device_number:03d}-guid-{random.randint(1000, 9999)}"
    
    # Vulnerability ID  
    vuln_id = f"vuln{record_id:06d}"
    
    # Definition ID
    def_id = random.randint(10000, 99999)
    
    # Random state (most open, some remediated)
    state = "Open" if random.random() < 0.85 else "Remediated"
    
    # Vary VPR score slightly from template
    base_score = vuln_template["definition.vpr.score"]
    vpr_score = round(base_score + random.uniform(-0.5, 0.5), 1)
    vpr_score = max(0.1, min(10.0, vpr_score))  # Keep within bounds
    
    return {
        "age_in_days": age_days,
        "asset.id": asset_id,
        "asset.ipv4_addresses": ip_addresses,
        "asset.name": device_name,
        "definition.cve": vuln_template["definition.cve"],
        "definition.description": vuln_template["definition.description"],
        "definition.family": vuln_template["definition.family"],
        "definition.id": def_id,
        "definition.name": vuln_template["definition.name"],
        "definition.plugin_updated": plugin_updated.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "definition.vpr.score": vpr_score,
        "definition.vpr_v2.drivers_cve_id": vuln_template["definition.cve"],
        "definition.vpr_v2.score": vpr_score,
        "definition.vulnerability_published": vuln_published.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "id": vuln_id,
        "port": vuln_template["port"],
        "protocol": vuln_template["protocol"],
        "resurfaced_date": resurfaced_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "severity": vuln_template["severity"],
        "state": state,
        "vuln_age": vuln_age,
        "vuln_sla_date": sla_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    }

def estimate_records_for_size(target_size_mb=60):
    """Estimate number of records needed for target file size"""
    # Based on actual generation: 74,017 records = 22.7MB
    # So approximately 325 bytes per record
    bytes_per_record = 325
    target_bytes = target_size_mb * 1024 * 1024
    return int(target_bytes / bytes_per_record)

def main():
    print("🔄 Generating large vulnerability dataset...")
    
    # Setup
    start_date, end_date = generate_random_date_range()
    target_records = estimate_records_for_size(60)  # ~60MB
    
    print(f"📅 Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"🎯 Target records: {target_records:,}")
    print(f"📝 Estimated file size: ~60MB")
    
    # CSV header (from sample file)
    fieldnames = [
        "age_in_days", "asset.id", "asset.ipv4_addresses", "asset.name",
        "definition.cve", "definition.description", "definition.family", 
        "definition.id", "definition.name", "definition.plugin_updated",
        "definition.vpr.score", "definition.vpr_v2.drivers_cve_id", 
        "definition.vpr_v2.score", "definition.vulnerability_published",
        "id", "port", "protocol", "resurfaced_date", "severity", 
        "state", "vuln_age", "vuln_sla_date"
    ]
    
    output_file = "/Volumes/DATA/GitHub/HexTrackr/sample data/test-vulnerabilities-large.csv"
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # Write header
        writer.writeheader()
        
        # Generate records
        for i in range(target_records):
            if i % 10000 == 0:
                print(f"📊 Generated {i:,} records...")
            
            # Pick random vulnerability template
            vuln_template = random.choice(SAMPLE_VULNERABILITIES)
            
            # Generate record
            record = generate_vulnerability_record(vuln_template, i + 1, start_date, end_date)
            
            # Write record
            writer.writerow(record)
    
    # Check actual file size
    import os
    file_size = os.path.getsize(output_file)
    file_size_mb = file_size / (1024 * 1024)
    
    print(f"✅ Generation complete!")
    print(f"📄 File: {output_file}")
    print(f"📊 Records: {target_records:,}")
    print(f"💾 Size: {file_size_mb:.1f} MB")
    print(f"📅 Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

if __name__ == "__main__":
    main()
