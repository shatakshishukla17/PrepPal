'use client'
// TestDbInsert.jsx - Create this as a separate component
import { useState } from 'react';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';

export default function TestDbInsert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Test direct SQL insert using the raw SQL API
  const testDirectInsert = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get the raw SQL client from your db connection
      // This assumes your db.js exports a sql client or has a way to access it
      // You may need to adjust this based on your actual db configuration
      const result = await db.insert(UserAnswer).values({
        mockId: 'test-mock-id',
        question: 'Test question',
        correctAns: 'Test correct answer',
        userAns: 'Test user answer',
        feedback: 'Test feedback',
        rating: '5',
        userEmail: 'test@example.com',
        createdAt: moment().format('DD-MM-yyyy')
      });
      
      console.log("Insert result:", result);
      setSuccess(true);
      toast.success('Test record inserted successfully!');
    } catch (err) {
      console.error("DB Error:", err);
      setError(err.message || 'Unknown database error');
      toast.error(`DB Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="mb-4 text-lg font-medium">Database Test Tool</h3>
      
      <Button 
        onClick={testDirectInsert}
        disabled={loading}
        className="text-white bg-blue-500 hover:bg-blue-600"
      >
        {loading ? 'Testing...' : 'Test DB Insert'}
      </Button>
      
      {error && (
        <div className="p-3 mt-4 text-red-700 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 mt-4 text-green-700 bg-green-100 border border-green-300 rounded">
          Test record inserted successfully!
        </div>
      )}
    </div>
  );
}