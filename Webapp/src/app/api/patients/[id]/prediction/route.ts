import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VitalData {
  heart_rate_bpm?: number;
  pulse_bpm?: number;
  spo2_percent?: number;
  body_temp_c?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  mean_bp?: number;
  recorded_at: string;
}

interface BreathData {
  ammonia_ppm?: number;
  co2_ppm_mq?: number;
  benzene_ppm?: number;
  co2_ppm_mhz19?: number;
  ethanol_ppm?: number;
  vocs_ppm_mics?: number;
  acetone_ppm_qcm?: number;
  voc_type_chemo?: string;
  voc_value_ppm_chemo?: number;
  recorded_at: string;
}

interface CacheEntry {
  id: string;
  patient_id: string;
  summary: string;
  risk_assessment: string;
  model_used: string;
  created_at: string;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
  );
}

function formatHealthDataForAnalysis(
  vitals: VitalData[],
  breathData: BreathData[]
): string {
  let dataText = "PATIENT HEALTH DATA ANALYSIS\n\n";

  // Format vitals data
  dataText += "=== VITAL SIGNS DATA ===\n";
  if (vitals.length === 0) {
    dataText += "No vital signs data available.\n";
  } else {
    vitals.forEach((vital, index) => {
      dataText += `Record ${index + 1} (${vital.recorded_at}):\n`;
      if (vital.heart_rate_bpm)
        dataText += `- Heart Rate: ${vital.heart_rate_bpm} bpm\n`;
      if (vital.pulse_bpm) dataText += `- Pulse: ${vital.pulse_bpm} bpm\n`;
      if (vital.spo2_percent) dataText += `- SpO2: ${vital.spo2_percent}%\n`;
      if (vital.body_temp_c)
        dataText += `- Body Temperature: ${vital.body_temp_c}°C\n`;
      if (vital.systolic_bp && vital.diastolic_bp) {
        dataText += `- Blood Pressure: ${vital.systolic_bp}/${vital.diastolic_bp} mmHg\n`;
      }
      if (vital.mean_bp) dataText += `- Mean BP: ${vital.mean_bp} mmHg\n`;
      dataText += "\n";
    });
  }

  // Format breath analysis data
  dataText += "=== BREATH ANALYSIS DATA ===\n";
  if (breathData.length === 0) {
    dataText += "No breath analysis data available.\n";
  } else {
    breathData.forEach((breath, index) => {
      dataText += `Record ${index + 1} (${breath.recorded_at}):\n`;
      if (breath.ammonia_ppm)
        dataText += `- Ammonia: ${breath.ammonia_ppm} ppm\n`;
      if (breath.co2_ppm_mq)
        dataText += `- CO2 (MQ): ${breath.co2_ppm_mq} ppm\n`;
      if (breath.co2_ppm_mhz19)
        dataText += `- CO2 (MHZ19): ${breath.co2_ppm_mhz19} ppm\n`;
      if (breath.benzene_ppm)
        dataText += `- Benzene: ${breath.benzene_ppm} ppm\n`;
      if (breath.ethanol_ppm)
        dataText += `- Ethanol: ${breath.ethanol_ppm} ppm\n`;
      if (breath.vocs_ppm_mics)
        dataText += `- VOCs (MICS): ${breath.vocs_ppm_mics} ppm\n`;
      if (breath.acetone_ppm_qcm)
        dataText += `- Acetone (QCM): ${breath.acetone_ppm_qcm} ppm\n`;
      if (breath.voc_type_chemo && breath.voc_value_ppm_chemo) {
        dataText += `- ${breath.voc_type_chemo}: ${breath.voc_value_ppm_chemo} ppm\n`;
      }
      dataText += "\n";
    });
  }

  return dataText;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;

    // Step 1: Get most recent data timestamps
    const { data: latestVital } = await supabase
      .from("vitals_monitoring")
      .select("recorded_at")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    const { data: latestBreath } = await supabase
      .from("breath_analysis")
      .select("recorded_at")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    // Step 2: Check cache
    const { data: cacheEntry } = await supabase
      .from("patient_predictions_cache")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Determine if cache is valid
    let useCache = false;
    if (cacheEntry) {
      const cacheTime = new Date(cacheEntry.created_at).getTime();
      const latestVitalTime = latestVital
        ? new Date(latestVital.recorded_at).getTime()
        : 0;
      const latestBreathTime = latestBreath
        ? new Date(latestBreath.recorded_at).getTime()
        : 0;
      const latestDataTime = Math.max(latestVitalTime, latestBreathTime);

      useCache = cacheTime > latestDataTime;
    }

    if (useCache && cacheEntry) {
      return NextResponse.json({
        success: true,
        data: {
          summary: cacheEntry.summary,
          risk_assessment: cacheEntry.risk_assessment,
          model_used: cacheEntry.model_used,
          created_at: cacheEntry.created_at,
          cached: true,
        },
      });
    }

    // Step 3: Fetch health data for analysis
    const { data: vitalsData } = await supabase
      .from("vitals_monitoring")
      .select("*")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(500);

    const { data: breathData } = await supabase
      .from("breath_analysis")
      .select("*")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(500);

    // Step 4: Format data for AI analysis
    const formattedData = formatHealthDataForAnalysis(
      vitalsData || [],
      breathData || []
    );

    // Step 5: Generate summary with Gemini
    const summaryPrompt = `As a medical AI assistant, analyze the following patient health data and provide a detailed, structured summary of health trends, patterns, and any notable anomalies. Focus on:

1. Vital signs trends (heart rate, blood pressure, oxygen saturation, temperature)
2. Breath analysis patterns and any concerning chemical levels
3. Temporal patterns and changes over time
4. Any values outside normal ranges
5. Correlations between different measurements

Please provide a comprehensive medical summary that will be used for further risk assessment.

${formattedData}`;

    const summary = await callGeminiAPI(summaryPrompt);

    // Step 6: Generate risk assessment
    const riskPrompt = `Based on the following health data summary, provide a medical risk assessment focusing on:

1. Potential lung diseases (COPD, asthma, lung cancer, pulmonary edema, etc.)
2. Cardiovascular risks (hypertension, arrhythmia, heart failure, etc.)
3. Metabolic disorders (diabetes complications, etc.)
4. Other health abnormalities indicated by the data
5. Severity levels and recommended actions

Provide specific medical reasoning for each identified risk. Format your response in a clear, professional medical assessment style.

HEALTH SUMMARY:
${summary}`;

    const riskAssessment = await callGeminiAPI(riskPrompt);

    // Step 7: Cache the results
    const { data: newCacheEntry, error: cacheError } = await supabase
      .from("patient_predictions_cache")
      .insert({
        patient_id: patientId,
        summary: summary,
        risk_assessment: riskAssessment,
        model_used: "gemini-2.0-flash",
      })
      .select()
      .single();

    if (cacheError) {
      console.error("Error caching prediction:", cacheError);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: summary,
        risk_assessment: riskAssessment,
        model_used: "gemini-2.0-flash",
        created_at: newCacheEntry?.created_at || new Date().toISOString(),
        cached: false,
      },
    });
  } catch (error: any) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
