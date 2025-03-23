// test-db.js
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
require('dotenv').config();

// Get database URL from environment
const sqlUrl = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;

if (!sqlUrl) {
    console.error('Database URL is not defined in the environment variables.');
    process.exit(1);
}

async function testInsert() {
    try {
        console.log('Connecting to database...');
        const sql = neon(sqlUrl);
        const db = drizzle(sql);
        
        // Test insert directly with SQL
        console.log('Testing insert...');
        
        const result = await sql`
            INSERT INTO "userAnswer" (
                "mockId", "question", "correctAns", "userAns", 
                "feedback", "rating", "userEmail", "createdAt", "metrics"
            ) VALUES (
                'test-mock-id', 
                'Test question', 
                'Test correct answer', 
                'Test user answer',
                'Test feedback', 
                '5', 
                'test@example.com', 
                '01-01-2025',
                '{"confidenceScore": 75, "speechMetrics": {"fluencyScore": 80}}'
            ) RETURNING id;
        `;
        
        if (result.length > 0) {
            console.log(`✅ Successfully inserted test record with ID: ${result[0].id}`);
        } else {
            console.log('❌ Insert operation did not return an ID');
        }
    } catch (error) {
        console.error('❌ Test insert failed:', error);
    }
}

// Run the test
testInsert().catch(console.error);