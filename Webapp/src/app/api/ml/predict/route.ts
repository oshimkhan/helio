import { NextRequest, NextResponse } from 'next/server';

async function waitForApi(mlApiUrl: string, maxRetries = 10, delay = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${mlApiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // API not ready yet, continue retrying
    }
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get ML API URL from environment or use default
    const mlApiUrl = process.env.ML_API_URL || 'http://127.0.0.1:8000';
    
    console.log('Proxying ML prediction request to:', `${mlApiUrl}/predict`);
    
    // Wait for API to be ready (with retries)
    const apiReady = await waitForApi(mlApiUrl);
    if (!apiReady) {
      console.warn('ML API not ready after retries, attempting request anyway...');
    }
    
    // Increase timeout for the actual request (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${mlApiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ML API error:', response.status, errorText);
        return NextResponse.json(
          { 
            success: false, 
            error: `ML API error: ${response.status} - ${errorText}` 
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('ML API request timed out after 30 seconds');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error proxying ML prediction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to ML API. Make sure the ML server is running on port 8000.' 
      },
      { status: 500 }
    );
  }
}

