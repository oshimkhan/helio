"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { assignDoctorToPatient } from "@/lib/utils";
import {
  Heart,
  Droplets,
  Thermometer,
  Shield,
  Activity,
  Brain,
  Wind,
  Apple,
  Pill,
  User,
  BarChart3,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AlertCircle,
  Maximize2,
  X,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Phone,
  Video,
} from "lucide-react";

const HealthDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [healthPrediction, setHealthPrediction] = useState<string | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Latest vitals for single-card display
  const [latestVitals, setLatestVitals] = useState<any | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState<boolean>(true);

  // Appointments of logged-in user
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);

  // Assigned doctor
  const [assignedDoctorName, setAssignedDoctorName] = useState<string | null>(null);
  const [assignedDoctorLoading, setAssignedDoctorLoading] = useState<boolean>(true);

  // Vital Dashboard tab state and datasets
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'doctor'>('overview');
  const [vitalsList, setVitalsList] = useState<any[]>([]);
  const [vitalsListLoading, setVitalsListLoading] = useState<boolean>(false);
  const [breathList, setBreathList] = useState<any[]>([]);
  const [breathListLoading, setBreathListLoading] = useState<boolean>(false);

  // Latest prescription for the logged-in user
  const [prescription, setPrescription] = useState<any | null>(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState<boolean>(true);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  // Cached AI risk assessment (markdown) and modal
  const [predictionMarkdown, setPredictionMarkdown] = useState<string>("");
  const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);

  // Request Appointment Modal and Form Data
  const [showRequestAppointmentModal, setShowRequestAppointmentModal] = useState<boolean>(false);
  const [requestAppointmentFormData, setRequestAppointmentFormData] = useState({
    appointment_date_time: "",
    reason: "",
    mode: "in-person",
    location_link: "",
    things_to_bring: "",
    duration: "",
    notes_for_doctor: ""
  });
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Sample data for charts (simplified representation)
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    value: Math.floor(Math.random() * 40) + 60,
  }));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setUserData(data);
          
          // After getting user data, fetch resources by patient_id
          if (data?.patient_id) {
            const pid = data.patient_id as string;
            // Only fetch latest vitals, appointments, and cached prediction by patient_id
            fetchLatestVitals(pid);
            fetchAppointmentsForUser(pid);
            fetchPredictionFromCache(pid);
            fetchLatestPrescription(pid);
            getOrAssignDoctor(pid);
            fetchVitalsList(pid);
            fetchBreathList(pid);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

  // close helpers area within useEffect
    fetchUserData();
  }, [supabase]);

  // Get or assign doctor to the patient, then set full name
  const getOrAssignDoctor = async (patientId: string) => {
    try {
      setAssignedDoctorLoading(true);
      
      // Use the utility function to assign a doctor (or get existing assignment)
      const doctorId = await assignDoctorToPatient(supabase, patientId);
      
      if (!doctorId) {
        setAssignedDoctorName(null);
        return;
      }

      // Fetch doctor details to display the name
      const { data: doctorRow, error: docErr } = await supabase
        .from('doctor')
        .select('first_name, last_name')
        .eq('doctor_id', doctorId)
        .single();
      
      if (docErr) throw docErr;
      
      const full = `${doctorRow?.first_name ?? ''} ${doctorRow?.last_name ?? ''}`.trim() || 'Assigned Doctor';
      setAssignedDoctorName(full);
    } catch (e) {
      console.error('Error getting/assigning doctor:', e);
      setAssignedDoctorName(null);
    } finally {
      setAssignedDoctorLoading(false);
    }
  };

  // Latest prescription
  const fetchLatestPrescription = async (patientId: string) => {
    try {
      setPrescriptionLoading(true);
      setPrescriptionError(null);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('medicines, description, created_at, id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setPrescription(data || null);
    } catch (e) {
      console.error('Error fetching latest prescription:', e);
      setPrescription(null);
      setPrescriptionError('Failed to load prescription');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Latest vitals for the single-card vitals section
  const fetchLatestVitals = async (patientId: string) => {
    try {
      setVitalsLoading(true);
      const { data, error } = await supabase
        .from('vitals_monitoring')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      setLatestVitals(data && data.length ? data[0] : null);
    } catch (e) {
      console.error('Error fetching latest vitals:', e);
      setLatestVitals(null);
    } finally {
      setVitalsLoading(false);
    }
  };

  // Fetch full vitals list for Vital Dashboard (newest first)
  const fetchVitalsList = async (patientId: string) => {
    try {
      setVitalsListLoading(true);
      const { data, error } = await supabase
        .from('vitals_monitoring')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      setVitalsList(data || []);
    } catch (e) {
      console.error('Error fetching vitals list:', e);
      setVitalsList([]);
    } finally {
      setVitalsListLoading(false);
    }
  };

  // Fetch breath analysis list for Vital Dashboard (newest first)
  const fetchBreathList = async (patientId: string) => {
    try {
      setBreathListLoading(true);
      const { data, error } = await supabase
        .from('breath_analysis')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      setBreathList(data || []);
    } catch (e: any) {
      console.error('Error fetching breath analysis list:', e?.message || e, e);
      setBreathList([]);
    } finally {
      setBreathListLoading(false);
    }
  };

  // Generic renderer for key-values, excluding ids
  const renderKeyValues = (obj: any) => {
    try {
      if (!obj || typeof obj !== 'object') return null;
      const skip = new Set(['id', 'patient_id']);
      const entries = Object.entries(obj).filter(([k, v]) => !skip.has(String(k)) && typeof v !== 'object');
      if (!entries.length) return null;
      return (
        <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {entries.map(([k, v]) => (
            <div key={String(k)} className="flex">
              <dt className="w-40 text-black capitalize">{String(k).replace(/_/g, ' ')}</dt>
              <dd className="text-black truncate">{String(v as any)}</dd>
            </div>
          ))}
        </dl>
      );
    } catch {
      return null;
    }
  };

  // Appointments list
  const fetchAppointmentsForUser = async (patientId: string) => {
    try {
      setAppointmentsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date_time', { ascending: false });
      if (error) throw error;
      setAppointments(data || []);
    } catch (e) {
      console.error('Error fetching appointments:', e);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Prediction from cache (markdown)
  const fetchPredictionFromCache = async (patientId: string) => {
    try {
      setPredictionLoading(true);
      setPredictionError(null);
      const { data, error } = await supabase
        .from('patient_predictions_cache')
        .select('risk_assessment')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const md = (data && (data as any).risk_assessment) ? (data as any).risk_assessment as string : '';
      setPredictionMarkdown(md || '');
    } catch (e) {
      console.error('Error fetching prediction cache:', e);
      setPredictionError('Failed to load prediction');
    } finally {
      setPredictionLoading(false);
    }
  };
  
  // Markdown renderer supporting tables and basic formatting
  const renderMarkdown = (text: string): string => {
    if (!text) return "";
    const inline = (s: string) =>
      s
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-black">$1<\/strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1<\/em>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100 text-black">$1<\/code>');

    const lines = text.split("\n");
    let i = 0;
    let out = "";
    while (i < lines.length) {
      const line = lines[i];
      // Table detection
      if (
        i + 1 < lines.length &&
        /^\s*\|.*\|\s*$/.test(lines[i]) &&
        /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])
      ) {
        const header = lines[i].trim();
        const sep = lines[i + 1].trim();
        i += 2;
        const rows: string[] = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          rows.push(lines[i].trim());
          i++;
        }
        const parseRow = (r: string) => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => inline(c.trim()));
        const ths = parseRow(header).map((h) => `<th class=\"px-3 py-2 text-left text-xs font-semibold text-black border-b\">${h}<\/th>`).join("");
        const trs = rows
          .map((r) => {
            const tds = parseRow(r).map((c) => `<td class=\"px-3 py-2 text-sm text-black border-b\">${c}<\/td>`).join("");
            return `<tr>${tds}<\/tr>`;
          })
          .join("");
        out += `<div class=\"overflow-x-auto\"><table class=\"w-full text-sm text-left border-collapse\"><thead class=\"bg-gray-100\"><tr>${ths}<\/tr><\/thead><tbody>${trs}<\/tbody><\/table><\/div>`;
        continue;
      }
      // Headings (force pitch black)
      if (/^\s*######\s+/.test(line)) { out += `<h6 class=\"text-sm font-semibold mt-4 text-black\">${inline(line.replace(/^\s*######\s+/, ""))}<\/h6>`; i++; continue; }
      if (/^\s*#####\s+/.test(line)) { out += `<h5 class=\"text-base font-semibold mt-4 text-black\">${inline(line.replace(/^\s*#####\s+/, ""))}<\/h5>`; i++; continue; }
      if (/^\s*####\s+/.test(line)) { out += `<h4 class=\"text-lg font-semibold mt-4 text-black\">${inline(line.replace(/^\s*####\s+/, ""))}<\/h4>`; i++; continue; }
      if (/^\s*###\s+/.test(line)) { out += `<h3 class=\"text-xl font-semibold mt-4 text-black\">${inline(line.replace(/^\s*###\s+/, ""))}<\/h3>`; i++; continue; }
      if (/^\s*##\s+/.test(line)) { out += `<h2 class=\"text-2xl font-semibold mt-4 text-black\">${inline(line.replace(/^\s*##\s+/, ""))}<\/h2>`; i++; continue; }
      if (/^\s*#\s+/.test(line)) { out += `<h1 class=\"text-3xl font-bold mt-4 text-black\">${inline(line.replace(/^\s*#\s+/, ""))}<\/h1>`; i++; continue; }
      if (/^\s*###\s+/.test(line)) { out += `<h3 class=\"text-xl font-bold mt-4\">${inline(line.replace(/^\s*###\s+/, ""))}<\/h3>`; i++; continue; }
      if (/^\s*##\s+/.test(line)) { out += `<h2 class=\"text-2xl font-bold mt-4\">${inline(line.replace(/^\s*##\s+/, ""))}<\/h2>`; i++; continue; }
      if (/^\s*#\s+/.test(line)) { out += `<h1 class=\"text-3xl font-extrabold mt-4\">${inline(line.replace(/^\s*#\s+/, ""))}<\/h1>`; i++; continue; }
      // Lists
      if (/^\s*[-*]\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
          i++;
        }
        out += `<ul class=\"list-disc pl-6 my-2 space-y-1 text-black\">${items.map(li => `<li class=\\"text-black\\">${inline(li)}<\/li>`).join("")}<\/ul>`;
        continue;
      }
      // Blockquote
      if (/^\s*>\s+/.test(line)) {
        out += `<blockquote class=\"border-l-4 pl-3 italic text-black my-2\">${inline(line.replace(/^\s*>\s+/, ""))}<\/blockquote>`; i++; continue;
      }
      // Paragraph
      if (line.trim() === "") { out += "<br/>"; i++; continue; }
      out += `<p class=\"my-2 text-black\">${inline(line)}<\/p>`; i++;
    }
    return out;
  };

  // Removed external ML API prediction path; using cached predictions only

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle appointment request form changes
  const handleRequestAppointmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequestAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit appointment request
  const handleSubmitAppointmentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.patient_id) {
      alert('Patient information not found. Please refresh and try again.');
      return;
    }

    if (!requestAppointmentFormData.appointment_date_time) {
      alert('Please select appointment date and time.');
      return;
    }

    try {
      setSubmittingRequest(true);

      // Get the assigned doctor for this patient
      const { data: assignment, error: assignmentError } = await supabase
        .from('doctor_patient_assignment')
        .select('doctor_id')
        .eq('patient_id', userData.patient_id)
        .single();

      if (assignmentError || !assignment) {
        alert('No doctor assigned. Please contact support.');
        return;
      }

      const appointmentData = {
        patient_id: userData.patient_id,
        doctor_id: assignment.doctor_id,
        appointment_date_time: requestAppointmentFormData.appointment_date_time,
        reason: requestAppointmentFormData.reason || null,
        mode: requestAppointmentFormData.mode,
        location_link: requestAppointmentFormData.location_link || null,
        things_to_bring: requestAppointmentFormData.things_to_bring || null,
        duration: requestAppointmentFormData.duration ? `${requestAppointmentFormData.duration} minutes` : null,
        notes_for_doctor: requestAppointmentFormData.notes_for_doctor || null,
        status: 'Not Approved' // Set status as 'Not Approved' for user requests
      };

      const { error } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (error) {
        console.error('Error creating appointment request:', error);
        alert(`Failed to submit appointment request: ${error.message}`);
        return;
      }

      // Reset form and close modal
      setRequestAppointmentFormData({
        appointment_date_time: "",
        reason: "",
        mode: "in-person",
        location_link: "",
        things_to_bring: "",
        duration: "",
        notes_for_doctor: ""
      });
      setShowRequestAppointmentModal(false);
      
      // Refresh appointments list
      if (userData?.patient_id) {
        fetchAppointmentsForUser(userData.patient_id);
      }
      
      alert('Appointment request submitted successfully! Your doctor will review and approve it.');
      
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      alert('Failed to submit appointment request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Nicely format medicines JSON from prescriptions
  const renderMedicines = (meds: any) => {
    try {
      const value = typeof meds === 'string' ? JSON.parse(meds) : meds;
      if (Array.isArray(value)) {
        return (
          <div className="space-y-3">
            {value.map((m: any, idx: number) => {
              const obj = (m && typeof m === 'object') ? m : { value: m };
              const name = (obj.name || obj.medicine || obj.drug || `Medicine ${idx + 1}`) as string;
              const entries = Object.entries(obj).filter(([k]) => !['name','medicine','drug'].includes(String(k)));
              return (
                <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-white/70">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black">{name}</span>
                    {obj.dosage && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{String(obj.dosage)}</span>}
                  </div>
                  {entries.length > 0 && (
                    <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      {entries.map(([k, v]) => (
                        <div key={String(k)} className="flex">
                          <dt className="w-28 text-black capitalize">{String(k).replace(/_/g,' ')}</dt>
                          <dd className="text-black">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      if (value && typeof value === 'object') {
        return (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {Object.entries(value).map(([k, v]) => (
              <div key={String(k)} className="flex">
                <dt className="w-28 text-black capitalize">{String(k).replace(/_/g,' ')}</dt>
                <dd className="text-black">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
              </div>
            ))}
          </dl>
        );
      }
      return <span className="text-sm text-black">No medicines data</span>;
    } catch (e) {
      return <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">{String(meds)}</pre>;
    }
  };

  const SimpleChart = ({
    data,
    color = "rgb(59, 130, 246)",
  }: {
    data: any[];
    color?: string;
  }) => (
    <div className="flex items-end justify-between h-16 gap-1">
      {data.map((point, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t-sm"
            style={{
              height: `${(point.value / 100) * 64}px`,
              backgroundColor: color,
              opacity: 0.7,
            }}
          />
          <span className="text-xs text-black mt-1">{point.day}</span>
        </div>
      ))}
    </div>
  );

  const getUserDisplayName = () => {
    if (!userData) return "User";
    const { first_name, last_name } = userData;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (first_name) {
      return first_name;
    } else if (last_name) {
      return last_name;
    }
    return "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 z-10">
        {/* Logo - Top Left */}
        <h2 className="text-xl font-bold text-black">AeroStream</h2>

        {/* User Profile - Top Right */}
        <div className="flex items-center space-x-3 relative">
          <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {getUserDisplayName()}
          </span>
          <div
            className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User className="w-5 h-5 text-white" />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] z-20">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-black hover:bg-gray-50 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Navigation Bar - Center Top */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 px-6 py-6">
          <nav className="flex items-center space-x-8">
            {/* Overview (Active) */}
            <button onClick={() => setActiveTab('overview')} className={`flex items-center transition-colors duration-200 ${activeTab === 'overview' ? 'text-blue-600' : 'text-black hover:text-blue-700'}`}>
              <BarChart3 className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Overview</span>
            </button>

            {/* Other Navigation Items */}
            <button onClick={() => setActiveTab('vitals')} className={`flex items-center transition-colors duration-200 ${activeTab === 'vitals' ? 'text-blue-600' : 'text-black hover:text-blue-700'}`}>
              <Activity className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Vital Dashboard</span>
            </button>

            <button onClick={() => setActiveTab('doctor')} className={`flex items-center transition-colors duration-200 ${activeTab === 'doctor' ? 'text-blue-600' : 'text-black hover:text-blue-700'}`}>
              <Heart className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Your Doctor</span>
            </button>

            <div className="flex items-center text-black cursor-pointer hover:text-black transition-colors duration-200">
              <Bell className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Conditions & Alert</span>
            </div>

            <div className="flex items-center text-black cursor-pointer hover:text-black transition-colors duration-200">
              <Settings className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Settings</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Welcome back, {getUserDisplayName()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">Assigned Doctor:</span>
            <span className="text-sm font-semibold text-black">{assignedDoctorLoading ? 'Loading...' : (assignedDoctorName ?? 'Not assigned')}</span>
          </div>
        </div>
        {activeTab === 'overview' ? (
          <>
            {/* Vitals Section - Single Composite Card */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-black mb-4">Vitals</h2>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-blue-100/40 ring-1 ring-gray-200/60 rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-black">Heart Rate</span>
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-black">{latestVitals?.heart_rate_bpm ?? latestVitals?.pulse_bpm ?? '--'}</span>
                    <span className="text-sm text-black ml-1">bpm</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-black">Blood Pressure</span>
                    <Activity className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-black">{latestVitals ? `${latestVitals.systolic_bp ?? '--'}/${latestVitals.diastolic_bp ?? '--'}` : '--/--'}</span>
                    <span className="text-sm text-black ml-1">mmHg</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-black">SpO2</span>
                    <Droplets className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-black">{latestVitals?.spo2_percent ?? '--'}</span>
                    <span className="text-sm text-black ml-1">%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-black">Temperature</span>
                    <Thermometer className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-black">{latestVitals?.body_temp_c ?? '--'}</span>
                    <span className="text-sm text-black ml-1">°C</span>
                  </div>
                </div>
              </div>
                  {vitalsLoading && (
                    <p className="text-sm text-black mt-4">Loading latest vitals...</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Health Prediction - Scrollable with Fullscreen */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-black mb-4">AI Health Prediction</h2>
              <Card className="relative border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-purple-100/40 ring-1 ring-gray-200/60 rounded-2xl">
                <CardContent className="p-6">
              {predictionLoading ? (
                <div className="flex items-center text-black"><div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full mr-2"></div>Loading prediction...</div>
              ) : predictionError ? (
                <p className="text-sm text-red-600">{predictionError}</p>
              ) : predictionMarkdown ? (
                <div className="relative">
                  <div className="max-h-80 overflow-y-auto pr-2 custom-scroll prose prose-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(predictionMarkdown) }} />
                  <button
                    aria-label="Expand prediction"
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:shadow-md border border-gray-200 transition"
                    onClick={() => setShowPredictionModal(true)}
                  >
                    <Maximize2 className="w-4 h-4 text-black" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-black">No prediction available.</p>
              )}
                </CardContent>
              </Card>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments */}
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-emerald-100/40 ring-1 ring-gray-200/60 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-black">
                <span className="text-black">Appointments</span>
                <div className="text-sm text-black">{appointmentsLoading ? 'Loading...' : `${appointments.length} total`}</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-sm text-black">Fetching appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="text-sm text-black">No appointments found.</div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const dt = new Date(appt.appointment_date_time);
                    return (
                      <div key={appt.id} className="p-3 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-black">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-emerald-600" />{dt.toLocaleDateString()}</div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-600" />{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">{appt.status}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">{appt.mode}</span>
                          {appt.location_link && (
                            <a href={appt.location_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <MapPin className="w-4 h-4" />Join/Location
                            </a>
                          )}
                        </div>
                        {appt.notes_for_doctor && (
                          <div className="mt-1 text-xs text-black">Notes: {appt.notes_for_doctor}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications (Latest Prescription) */}
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-purple-100/40 ring-1 ring-gray-200/60 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-black">
                <span className="flex items-center text-black"><Pill className="w-5 h-5 mr-2 text-purple-600" />Medications</span>
                {prescription && (
                  <span className="text-xs text-black">{new Date(prescription.created_at).toLocaleString()}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptionLoading ? (
                <div className="text-sm text-black">Loading medications...</div>
              ) : prescriptionError ? (
                <div className="text-sm text-red-600">{prescriptionError}</div>
              ) : !prescription ? (
                <div className="text-sm text-black">No prescription found.</div>
              ) : (
                <div className="space-y-4">
                  {prescription.description && (
                    <p className="text-sm text-black">{prescription.description}</p>
                  )}
                  <div>
                    {renderMedicines(prescription.medicines)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </div>

            {/* Quick Actions (bottom only) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Activity className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Log Vitals</p>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Bell className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm font-medium">Set Reminder</p>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <User className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium">Book Appointment</p>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Settings className="w-6 h-6 text-black mb-2" />
                  <p className="text-sm font-medium">Settings</p>
                </button>
              </div>
            </CardContent>
              </Card>
            </div>
          </>
        ) : activeTab === 'vitals' ? (
          <>
            {/* Vital Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Vitals List */}
              <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-blue-100/40 ring-1 ring-gray-200/60 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span className="text-black">Vitals (Recent)</span>
                    <div className="text-sm text-black">{vitalsListLoading ? 'Loading...' : `${vitalsList.length} records`}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vitalsListLoading ? (
                    <div className="text-sm text-black">Fetching vitals...</div>
                  ) : vitalsList.length === 0 ? (
                    <div className="text-sm text-black">No vitals found.</div>
                  ) : (
                    <div className="space-y-3">
                      {vitalsList.map((v) => {
                        const ts = new Date((v as any).recorded_at || (v as any).created_at || Date.now());
                        return (
                          <div key={(v as any).id ?? ts.toISOString()} className="p-3 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-black">{ts.toLocaleString()}</div>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">vitals</span>
                            </div>
                            {renderKeyValues(v)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Breath Analysis List */}
              <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-cyan-100/40 ring-1 ring-gray-200/60 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span className="text-black">Breath Analysis (Recent)</span>
                    <div className="text-sm text-black">{breathListLoading ? 'Loading...' : `${breathList.length} records`}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {breathListLoading ? (
                    <div className="text-sm text-black">Fetching breath analysis...</div>
                  ) : breathList.length === 0 ? (
                    <div className="text-sm text-black">No breath analysis found.</div>
                  ) : (
                    <div className="space-y-3">
                      {breathList.map((b) => {
                        const ts = new Date((b as any).recorded_at || (b as any).created_at || Date.now());
                        return (
                          <div key={(b as any).id ?? ts.toISOString()} className="p-3 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-black">{ts.toLocaleString()}</div>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-50 text-cyan-700 border border-cyan-100">breath</span>
                            </div>
                            {renderKeyValues(b)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : activeTab === 'doctor' ? (
          <>
            {/* Your Doctor Tab */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Appointments */}
              <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-emerald-100/40 ring-1 ring-gray-200/60 rounded-2xl relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span className="text-black">Appointments</span>
                    <div className="text-sm text-black">{appointmentsLoading ? 'Loading...' : `${appointments.length} total`}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="text-sm text-black">Fetching appointments...</div>
                  ) : appointments.length === 0 ? (
                    <div className="text-sm text-black">No appointments found.</div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appt) => {
                        const dt = new Date(appt.appointment_date_time);
                        return (
                          <div key={appt.id} className="p-3 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-black">
                              <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-emerald-600" />{dt.toLocaleDateString()}</div>
                              <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-600" />{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">{appt.status}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">{appt.mode}</span>
                              {appt.location_link && (
                                <a href={appt.location_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                  <MapPin className="w-4 h-4" />Join/Location
                                </a>
                              )}
                            </div>
                            {appt.notes_for_doctor && (
                              <div className="mt-1 text-xs text-black">Notes: {appt.notes_for_doctor}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                {/* Floating Request Appointment Button */}
                <button
                  onClick={() => setShowRequestAppointmentModal(true)}
                  className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Request Appointment
                </button>
              </Card>

              {/* Doctor Information */}
              <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50 shadow-xl shadow-blue-100/40 ring-1 ring-gray-200/60 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-black">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Your Assigned Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedDoctorLoading ? (
                    <div className="text-sm text-black">Loading doctor information...</div>
                  ) : assignedDoctorName ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-black">Dr. {assignedDoctorName}</h3>
                            <p className="text-sm text-gray-600">Your Assigned Doctor</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>You can request appointments with your assigned doctor using the "Request Appointment" button above.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-black">No doctor assigned yet.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        {/* Fullscreen Modal for AI Prediction */}
        {showPredictionModal && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPredictionModal(false)} />
            <div className="absolute inset-4 md:inset-10 lg:inset-16 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 overflow-hidden z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-black">AI Health Prediction</h3>
                <button aria-label="Close" className="p-2 rounded-full hover:bg-gray-100" onClick={() => setShowPredictionModal(false)}>
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {predictionMarkdown ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(predictionMarkdown) }} />
                ) : (
                  <p className="text-sm text-black">No prediction available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request Appointment Modal */}
        {showRequestAppointmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-gray-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Request Appointment
                </h2>
                <button
                  onClick={() => setShowRequestAppointmentModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                  disabled={submittingRequest}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitAppointmentRequest} className="space-y-6">
                {/* Date and Time */}
                <div>
                  <label htmlFor="appointment_date_time" className="mb-1 block text-sm font-medium text-gray-700">
                    Preferred Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="appointment_date_time"
                    name="appointment_date_time"
                    value={requestAppointmentFormData.appointment_date_time}
                    onChange={handleRequestAppointmentFormChange}
                    required
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-700">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={requestAppointmentFormData.reason}
                    onChange={handleRequestAppointmentFormChange}
                    placeholder="e.g., Regular checkup, Follow-up consultation, etc."
                    rows={3}
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Mode */}
                <div>
                  <label htmlFor="mode" className="mb-1 block text-sm font-medium text-gray-700">
                    Preferred Mode *
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    value={requestAppointmentFormData.mode}
                    onChange={handleRequestAppointmentFormChange}
                    required
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="online">Online</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                {/* Location/Link */}
                {(requestAppointmentFormData.mode === 'online' || requestAppointmentFormData.mode === 'phone') && (
                  <div>
                    <label htmlFor="location_link" className="mb-1 block text-sm font-medium text-gray-700">
                      {requestAppointmentFormData.mode === 'online' ? 'Preferred Meeting Platform' : 'Phone Number'}
                    </label>
                    <input
                      type={requestAppointmentFormData.mode === 'online' ? 'text' : 'tel'}
                      id="location_link"
                      name="location_link"
                      value={requestAppointmentFormData.location_link}
                      onChange={handleRequestAppointmentFormChange}
                      placeholder={requestAppointmentFormData.mode === 'online' ? 'e.g., Google Meet, Zoom, etc.' : '+1234567890'}
                      disabled={submittingRequest}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:bg-gray-50"
                    />
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="mb-1 block text-sm font-medium text-gray-700">
                    Expected Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={requestAppointmentFormData.duration}
                    onChange={handleRequestAppointmentFormChange}
                    placeholder="30"
                    min="15"
                    max="180"
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Things to Bring */}
                <div>
                  <label htmlFor="things_to_bring" className="mb-1 block text-sm font-medium text-gray-700">
                    Things to Bring
                  </label>
                  <textarea
                    id="things_to_bring"
                    name="things_to_bring"
                    value={requestAppointmentFormData.things_to_bring}
                    onChange={handleRequestAppointmentFormChange}
                    placeholder="e.g., Previous test reports, insurance card, medications list"
                    rows={2}
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Notes for Doctor */}
                <div>
                  <label htmlFor="notes_for_doctor" className="mb-1 block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes_for_doctor"
                    name="notes_for_doctor"
                    value={requestAppointmentFormData.notes_for_doctor}
                    onChange={handleRequestAppointmentFormChange}
                    placeholder="Any additional information or special instructions"
                    rows={3}
                    disabled={submittingRequest}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestAppointmentModal(false)}
                    disabled={submittingRequest}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingRequest && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    )}
                    {submittingRequest ? 'Submitting...' : 'Request Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;
