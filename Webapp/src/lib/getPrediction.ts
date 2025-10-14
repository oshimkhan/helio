export async function getMlPrediction(healthData: any) {
  try {
    const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${mlApiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(healthData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling ML prediction API:", error);
    throw error;
  }
}
