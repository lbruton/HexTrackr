#!/usr/bin/env python3
"""
Quick restore script to import hexagon-tickets.csv into SQLite database
Restores the original XT# numbering and data structure
"""

import csv
import sqlite3
import uuid
from datetime import datetime

def restore_tickets():
    # Connect to database
    conn = sqlite3.connect('data/hextrackr.db')
    cursor = conn.cursor()
    
    # Read CSV and import data
    with open('hexagon-tickets.csv', 'r') as f:
        reader = csv.DictReader(f)
        
        # Track XT# counter - find the highest number from your data
        xt_counter = 1  # Start from 1, will increment as we process
        
        for row in reader:
            # Generate unique ID
            ticket_id = str(uuid.uuid4())
            
            # Get location_id from locations table
            cursor.execute("SELECT id FROM locations WHERE code = ?", (row['Location'],))
            location_result = cursor.fetchone()
            location_id = location_result[0] if location_result else None
            
            # Generate XT# (format: XT{counter:04d})
            xt_number = f"XT{xt_counter:04d}"
            xt_counter += 1
            
            # Parse dates
            date_submitted = row['Date Submitted']
            date_due = row['Date Due']
            
            # Current timestamp
            now = datetime.now().isoformat()
            
            # Insert ticket
            cursor.execute("""
                INSERT INTO tickets (
                    id, date_submitted, date_due, hexagon_ticket, service_now_ticket,
                    location, devices, supervisor, tech, status, notes,
                    created_at, updated_at, xt_number, location_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ticket_id,
                date_submitted,
                date_due,
                row['Hexagon Ticket #'].strip('"'),  # Remove quotes
                row['Service Now #'],
                row['Location'],
                row['Devices'],  # Store as text for now
                row['Supervisor'],
                row['Tech'],
                row['Status'],
                row['Notes'],
                now,
                now,
                xt_number,
                location_id
            ))
            
            print(f"Imported: {xt_number} - {row['Hexagon Ticket #']} - {row['Location']}")
    
    # Commit and close
    conn.commit()
    conn.close()
    print(f"\nRestored {xt_counter-1} tickets successfully!")

if __name__ == "__main__":
    restore_tickets()
