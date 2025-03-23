// migrate-metrics.js - Run this with Node to add or fix the metrics column
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Get database URL from environment
const sqlUrl = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;

if (!sqlUrl) {
    console.error('Database URL is not defined in the environment variables.');
    process.exit(1);
}

async function migrateMetrics() {
    try {
        console.log('Connecting to database...');
        const sql = neon(sqlUrl);
        
        // Check if metrics column exists
        const checkColumnExists = await sql`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'userAnswer'
            AND column_name = 'metrics';
        `;
        
        if (checkColumnExists.length === 0) {
            console.log('Metrics column does not exist. Adding it...');
            
            // Add metrics column if it doesn't exist
            await sql`
                ALTER TABLE "userAnswer"
                ADD COLUMN "metrics" TEXT;
            `;
            
            console.log('✅ Added metrics column successfully!');
        } else {
            console.log('✅ Metrics column already exists.');
        }
        
        // Test if we can update metrics values for existing records
        console.log('Testing metrics update...');
        
        // Create a test metrics JSON
        const testMetrics = JSON.stringify({
            confidenceScore: 80,
            speechMetrics: {
                fluencyScore: 85,
                speakingRate: 130
            },
            expressionMetrics: {
                happiness: 75,
                neutrality: 20,
                nervousness: 5
            }
        });
        
        // Update the first record as a test
        const updateResult = await sql`
            UPDATE "userAnswer"
            SET "metrics" = ${testMetrics}
            WHERE "id" = (SELECT MIN("id") FROM "userAnswer")
            RETURNING "id";
        `;
        
        if (updateResult.length > 0) {
            console.log(`✅ Successfully updated metrics for record ID ${updateResult[0].id}`);
        } else {
            console.log('No records to update.');
        }
        
        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// Run the migration
migrateMetrics().catch(error => {
    console.error('Unhandled error:', error);
});