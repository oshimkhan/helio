export async function getMlPrediction(healthData: any) {
  try {
    // Use Next.js API route as proxy to avoid CORS issues
    // This works both client-side and server-side
    const response = await fetch('/api/ml/predict', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(healthData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error calling ML prediction API:", error);
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error(
        "Failed to connect to ML API. Please make sure the ML server is running. " +
        "Run 'npm run dev' in the Webapp directory to start both servers."
      );
    }
    throw error;
  }
}
