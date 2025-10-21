// Temporary script to seed email templates
const sqlite3 = require('sqlite3').verbose();
const { seedAllTemplates } = require('./app/utils/seedEmailTemplates.js');

const DB_PATH = './app/data/hextrackr.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database');
});

(async () => {
    try {
        console.log('Seeding all templates...');
        await seedAllTemplates(db);
        console.log('✅ All templates seeded successfully!');

        // Verify
        db.all('SELECT name, LENGTH(template_content) as len FROM email_templates ORDER BY name', (err, rows) => {
            if (err) {
                console.error('Error querying templates:', err.message);
            } else {
                console.log('\nEmail templates in database:');
                rows.forEach(row => {
                    console.log(`  - ${row.name}: ${row.len} characters`);
                });
            }

            // Also check ticket templates
            db.all('SELECT name, LENGTH(template_content) as len FROM ticket_templates ORDER BY name', (err2, rows2) => {
                if (err2) {
                    console.error('Error querying ticket templates:', err2.message);
                } else {
                    console.log('\nTicket templates in database:');
                    rows2.forEach(row => {
                        console.log(`  - ${row.name}: ${row.len} characters`);
                    });
                }
                db.close();
            });
        });
    } catch (error) {
        console.error('Error seeding templates:', error);
        db.close();
        process.exit(1);
    }
})();
