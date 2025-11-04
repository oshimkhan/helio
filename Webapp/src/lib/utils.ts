import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique patient ID based on the specified format:
 * - First 2 characters: Last 2 digits of the current year
 * - Next 2 characters: Country code (e.g., NP, IN, US)
 * - Remaining characters: Sequential number with padding
 * 
 * The format evolves as follows:
 * 1. Initial format: YYCCSSSSS (e.g., 25NP00001) - 9 characters
 * 2. When numbers exhaust: YYCCSSSSSA (e.g., 25NP00001A) - 10 characters
 * 3. When single letters exhaust: YYCCSSSSSZAA (e.g., 25NP00001ZA) - 11+ characters
 * 
 * @param country - The country code (e.g., 'NP', 'IN', 'US')
 * @param existingIds - Array of existing patient IDs to ensure uniqueness
 * @returns A unique patient ID string
 */
export async function generatePatientId(supabase: any, countryName: string) {
  // Get country code (2 letters)
  const countryCode = getCountryCode(countryName);
  
  // Get year suffix (last 2 digits of current year)
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  
  // Prefix is combination of year and country code
  const prefix = `${yearSuffix}${countryCode}`;
  
  // Get the latest patient ID with this prefix
  const { data } = await supabase
    .from('users')
    .select('patient_id')
    .like('patient_id', `${prefix}%`)
    .order('patient_id', { ascending: false })
    .limit(1);
  
  if (!data || data.length === 0) {
    // No existing IDs with this prefix, start with 00001
    return `${prefix}00001`;
  }
  
  const latestId = data[0].patient_id;
  return incrementPatientId(latestId, prefix);
}

/**
 * Extracts a 2-letter country code from the country name
 */
function getCountryCode(countryName: string): string {
  // Map of country names to their 2-letter codes
  const countryCodeMap: Record<string, string> = {
    'Nepal': 'NP',
    'India': 'IN',
    'United States': 'US',
    // Add more countries as needed
  };
  
  return countryCodeMap[countryName] || countryName.slice(0, 2).toUpperCase();
}

/**
 * Increments the patient ID following the specified format rules
 */
function incrementPatientId(currentId: string, prefix: string): string {
  // Extract the numeric/alphanumeric part after the prefix
  const suffixPart = currentId.slice(prefix.length);
  
  // Case 1: Pure numeric suffix (e.g., 25NP00001)
  if (/^\d+$/.test(suffixPart)) {
    const numericPart = parseInt(suffixPart, 10);
    
    // If we haven't reached 99999 yet, just increment
    if (numericPart < 99999) {
      return `${prefix}${(numericPart + 1).toString().padStart(5, '0')}`;
    }
    
    // We've reached 99999, move to format with single letter suffix
    return `${prefix}00001A`;
  }
  
  // Case 2: Numeric with single letter suffix (e.g., 25NP00001A)
  if (/^\d+[A-Z]$/.test(suffixPart)) {
    const numericPart = suffixPart.slice(0, -1);
    const letterPart = suffixPart.slice(-1);
    
    // If letter isn't Z, just increment the letter
    if (letterPart !== 'Z') {
      const nextLetter = String.fromCharCode(letterPart.charCodeAt(0) + 1);
      return `${prefix}${numericPart}${nextLetter}`;
    }
    
    // We've reached Z, move to format with multiple letter suffix
    return `${prefix}${numericPart}ZA`;
  }
  
  // Case 3: Complex alphanumeric suffix (e.g., 25NP00001ZA)
  // This handles all other cases with multiple letter suffixes
  const match = suffixPart.match(/^(\d+)([A-Z]+)$/);
  if (match) {
    const [, numericPart, lettersPart] = match;
    
    // Increment the letters part as if it were a number in base 26
    let carry = true;
    const letters = lettersPart.split('');
    
    for (let i = letters.length - 1; i >= 0; i--) {
      if (carry) {
        if (letters[i] === 'Z') {
          letters[i] = 'A';
          carry = true; // Continue carrying to next position
        } else {
          letters[i] = String.fromCharCode(letters[i].charCodeAt(0) + 1);
          carry = false; // No need to carry anymore
        }
      }
    }
    
    // If we still have a carry, we need to add another 'A' at the beginning
    if (carry) {
      letters.unshift('A');
    }
    
    return `${prefix}${numericPart}${letters.join('')}`;
  }
  
  // Fallback case (should never happen with proper data)
  return `${prefix}00001`;
}

/**
 * Automatically assigns a doctor to a patient if they don't have one.
 * Assigns the doctor with the lowest number of patients.
 * 
 * @param supabase - Supabase client instance
 * @param patientId - The patient ID to assign a doctor to
 * @returns The assigned doctor_id or null if no doctors available or assignment failed
 */
export async function assignDoctorToPatient(supabase: any, patientId: string): Promise<number | null> {
  try {
    // Check if patient already has a doctor assigned
    const { data: assignment, error: aErr } = await supabase
      .from('doctor_patient_assignment')
      .select('doctor_id')
      .eq('patient_id', patientId)
      .maybeSingle();
    
    if (aErr) {
      console.error('Error checking existing assignment:', aErr);
      return null;
    }

    // If already assigned, return the existing doctor_id
    if (assignment?.doctor_id) {
      return assignment.doctor_id;
    }

    // Get all doctors
    const { data: allDoctors, error: dErr } = await supabase
      .from('doctor')
      .select('doctor_id, first_name, last_name');
    
    if (dErr) {
      console.error('Error fetching doctors:', dErr);
      return null;
    }

    // Filter out doctors with null doctor_id
    const doctors = (allDoctors || []).filter((doc: any) => doc.doctor_id !== null && doc.doctor_id !== undefined);

    if (!doctors || doctors.length === 0) {
      console.warn('No doctors available for assignment (all doctors may have null doctor_id)');
      return null;
    }

    // Get all existing assignments to count patients per doctor
    const { data: assignments, error: cErr } = await supabase
      .from('doctor_patient_assignment')
      .select('doctor_id, patient_id');
    
    if (cErr) {
      console.error('Error fetching assignments:', cErr);
      return null;
    }

    // Count patients per doctor
    const counts = new Map<number, number>();
    assignments?.forEach((row: any) => {
      counts.set(row.doctor_id, (counts.get(row.doctor_id) || 0) + 1);
    });

    // Find doctor with lowest number of patients
    let chosen: any | null = null;
    let min = Number.POSITIVE_INFINITY;
    doctors.forEach((doc: any) => {
      const cnt = counts.get(doc.doctor_id) || 0;
      if (cnt < min) {
        min = cnt;
        chosen = doc;
      }
    });

    if (!chosen) {
      console.warn('Could not select a doctor for assignment');
      return null;
    }

    const doctorId = chosen.doctor_id as number;

    // Validate doctor_id is not null
    if (!doctorId || doctorId === null) {
      console.error('Selected doctor has null doctor_id:', chosen);
      return null;
    }

    // Validate patient_id exists
    const { data: patientCheck, error: patientCheckErr } = await supabase
      .from('users')
      .select('patient_id')
      .eq('patient_id', patientId)
      .maybeSingle();
    
    if (patientCheckErr || !patientCheck) {
      console.error('Patient ID does not exist in users table:', patientId, patientCheckErr);
      return null;
    }

    // Double-check assignment doesn't already exist (race condition protection)
    const { data: existingCheck } = await supabase
      .from('doctor_patient_assignment')
      .select('doctor_id')
      .eq('patient_id', patientId)
      .maybeSingle();
    
    if (existingCheck?.doctor_id) {
      console.log(`Patient ${patientId} already has doctor ${existingCheck.doctor_id} assigned`);
      return existingCheck.doctor_id;
    }

    // Insert the assignment
    const { data: insertData, error: insErr } = await supabase
      .from('doctor_patient_assignment')
      .insert({ doctor_id: doctorId, patient_id: patientId })
      .select();
    
    if (insErr) {
      // Log detailed error information
      try {
        console.error('Error inserting doctor assignment:', JSON.stringify(insErr, null, 2));
        console.error('Error details:', {
          code: insErr.code,
          message: insErr.message,
          details: insErr.details,
          hint: insErr.hint,
          doctorId,
          patientId
        });
      } catch (e) {
        console.error('Error inserting doctor assignment (raw):', insErr);
        console.error('doctorId:', doctorId, 'patientId:', patientId);
      }
      
      // If it's a unique constraint violation, try to get the existing assignment
      if (insErr.code === '23505' || insErr.message?.includes('unique')) {
        console.log('Unique constraint violation detected, fetching existing assignment');
        const { data: existing } = await supabase
          .from('doctor_patient_assignment')
          .select('doctor_id')
          .eq('patient_id', patientId)
          .maybeSingle();
        
        if (existing?.doctor_id) {
          return existing.doctor_id;
        }
      }
      
      return null;
    }

    console.log(`Successfully assigned doctor ${doctorId} to patient ${patientId}`);
    return doctorId;
  } catch (e) {
    console.error('Error in assignDoctorToPatient:', e);
    return null;
  }
}
