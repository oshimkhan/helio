"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { countries } from "@/utils/countries";
import { debounce } from "lodash";
import { generatePatientId, assignDoctorToPatient } from "@/lib/utils";
import { User, Stethoscope, Shield, Mail, Lock, UserCircle, Phone, MapPin, Calendar, AlertCircle, GraduationCap, FileText, Briefcase, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type UserType = "user" | "doctor" | "admin";

export default function UnifiedSignup() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [selectedUserType, setSelectedUserType] = useState<UserType>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Common form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    country: "",
    address: "",
    contact: "",
    // User-specific fields
    date_of_birth: "",
    user_contact: "",
    emergency_contact: "",
    medical_history: "",
    // Doctor-specific fields
    username: "",
    degrees: "",
    medical_license_number: "",
    training_history: "",
    area_of_expertise: "",
    // Admin-specific fields
    admin_username: "",
  });

  const [userContactCode, setUserContactCode] = useState("");
  const [emergencyContactCode, setEmergencyContactCode] = useState("");
  const [contactCountryCode, setContactCountryCode] = useState("");

  const userTypeOptions = [
    { value: "user", label: "Patient", icon: "👤", color: "from-blue-500 to-cyan-500" },
    { value: "doctor", label: "Doctor", icon: "👨‍⚕️", color: "from-green-500 to-emerald-500" },
    { value: "admin", label: "Admin", icon: "👨‍💼", color: "from-purple-500 to-pink-500" },
  ];

  useEffect(() => {
    if (countries.length > 0) {
      setContactCountryCode(countries[0].phone_code);
      setUserContactCode(countries[0].phone_code);
      setEmergencyContactCode(countries[0].phone_code);
    }
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.country
      );
      if (selectedCountry) {
        setUserContactCode(selectedCountry.phone_code);
        setEmergencyContactCode(selectedCountry.phone_code);
        setContactCountryCode(selectedCountry.phone_code);
      }
    }
  }, [formData.country]);

  const checkUsernameAvailability = debounce(
    async (username: string, table: string) => {
      if (!username) {
        setUsernameAvailable(null);
        setCheckingUsername(false);
        return;
      }
      const allowedCharsRegex = /^[a-z0-9_-]+$/;
      if (!allowedCharsRegex.test(username)) {
        setUsernameAvailable(false);
        setCheckingUsername(false);
        return;
      }

      setCheckingUsername(true);
      setUsernameAvailable(null);

      const { data, error } = await supabase
        .from(table)
        .select("username")
        .eq("username", username)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        setUsernameAvailable(false);
      } else if (data) {
        setUsernameAvailable(false);
      } else {
        setUsernameAvailable(true);
      }
      setCheckingUsername(false);
    },
    500
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username" && selectedUserType === "doctor") {
      checkUsernameAvailability(value.toLowerCase(), "doctor");
    } else if (name === "admin_username" && selectedUserType === "admin") {
      checkUsernameAvailability(value.toLowerCase(), "admin");
    }
  };

  const handleCountryCodeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: "user" | "emergency" | "contact"
  ) => {
    const { value } = e.target;
    if (field === "user") {
      setUserContactCode(value);
    } else if (field === "emergency") {
      setEmergencyContactCode(value);
    } else if (field === "contact") {
      setContactCountryCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupSuccess(false);

    // Username validation for doctor and admin
    if (
      (selectedUserType === "doctor" || selectedUserType === "admin") &&
      usernameAvailable === false
    ) {
      setError("Username is not available or contains invalid characters.");
      setLoading(false);
      return;
    }
    if (checkingUsername) {
      setError("Please wait while username availability is checked.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        let insertError;

        if (selectedUserType === "user") {
          // Generate a unique patient ID
          const patientId = await generatePatientId(supabase, formData.country);
          
          // Insert into users table
          const { error } = await supabase.from("users").insert([
            {
              id: authData.user.id,
              patient_id: patientId, // Add the generated patient ID
              first_name: formData.first_name,
              middle_name: formData.middle_name,
              last_name: formData.last_name,
              gender: formData.gender,
              date_of_birth: formData.date_of_birth,
              country: formData.country,
              user_contact: `${userContactCode}${formData.user_contact}`,
              emergency_contact: `${emergencyContactCode}${formData.emergency_contact}`,
              medical_history: formData.medical_history
                .split(",")
                .map((item) => item.trim()),
              address: formData.address,
            },
          ]);
          insertError = error;
          
          // Automatically assign a doctor to the new patient
          if (!insertError && patientId) {
            await assignDoctorToPatient(supabase, patientId);
          }
        } else if (selectedUserType === "doctor") {
          // Insert into doctor table
          const { error } = await supabase.from("doctor").insert([
            {
              id: authData.user.id,
              first_name: formData.first_name,
              middle_name: formData.middle_name,
              last_name: formData.last_name,
              username: formData.username.toLowerCase(),
              country: formData.country,
              address: formData.address,
              contact: `${contactCountryCode}${formData.contact}`,
              gender: formData.gender,
              degrees: formData.degrees,
              medical_license_number: formData.medical_license_number,
              training_history: formData.training_history,
              area_of_expertise: formData.area_of_expertise,
            },
          ]);
          insertError = error;
        } else if (selectedUserType === "admin") {
          // Insert into admin table
          const { error } = await supabase.from("admin").insert([
            {
              id: authData.user.id,
              first_name: formData.first_name,
              middle_name: formData.middle_name,
              last_name: formData.last_name,
              username: formData.admin_username.toLowerCase(),
              address: formData.address,
              contact: `${contactCountryCode}${formData.contact}`,
            },
          ]);
          insertError = error;
        }

        if (insertError) throw insertError;

        setSignupSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">Join Healio and start your health journey</p>
          </motion.div>

          {/* User Type Tabs */}
          <motion.div
            className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {userTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedUserType(option.value as UserType)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  selectedUserType === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-xl mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </motion.div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start space-x-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </motion.div>
          )}

          {signupSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm text-center"
            >
              <CheckCircle2 className="w-5 h-5 inline mr-2" />
              Account created successfully! Redirecting to login...
            </motion.div>
          )}

          {!signupSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your first name"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your middle name"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your last name"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                    aria-label="Select Gender"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                    aria-label="Select Country"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={contactCountryCode}
                      onChange={(e) => handleCountryCodeChange(e, "contact")}
                      className="flex-shrink-0 px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 w-1/3 text-sm"
                      aria-label="Select Contact Country Code"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.phone_code}>
                          {country.phone_code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="contact"
                        required
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                    rows={3}
                    placeholder="Enter your address"
                  />
                </div>
              </motion.div>

              {/* User-specific fields */}
              {selectedUserType === "user" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        required
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        title="Select your date of birth"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact *
                      </label>
                      <div className="flex">
                        <select
                          value={emergencyContactCode}
                          onChange={(e) =>
                            handleCountryCodeChange(e, "emergency")
                          }
                          className="flex-shrink-0 mr-2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-1/4"
                          aria-label="Select Emergency Contact Country Code"
                        >
                          {countries.map((country) => (
                            <option
                              key={country.code}
                              value={country.phone_code}
                            >
                              {country.name} ({country.phone_code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="emergency_contact"
                          required
                          value={formData.emergency_contact}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-3/4"
                          placeholder="e.g., 0987654321"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical History (comma-separated)
                    </label>
                    <textarea
                      name="medical_history"
                      value={formData.medical_history}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows={3}
                      placeholder="e.g., Allergies, Diabetes, etc."
                    />
                  </div>
                </>
              )}

              {/* Doctor-specific fields */}
              {selectedUserType === "doctor" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          usernameAvailable === true
                            ? "border-green-500"
                            : usernameAvailable === false
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter username"
                      />
                      {checkingUsername && (
                        <p className="text-xs text-gray-500 mt-1">
                          Checking availability...
                        </p>
                      )}
                      {usernameAvailable === true && (
                        <p className="text-xs text-green-600 mt-1">
                          Username available!
                        </p>
                      )}
                      {usernameAvailable === false && (
                        <p className="text-xs text-red-600 mt-1">
                          Username not available
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number *
                      </label>
                      <input
                        type="text"
                        name="medical_license_number"
                        required
                        value={formData.medical_license_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter license number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degrees *
                    </label>
                    <input
                      type="text"
                      name="degrees"
                      required
                      value={formData.degrees}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="e.g., MD, MBBS, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area of Expertise *
                    </label>
                    <input
                      type="text"
                      name="area_of_expertise"
                      required
                      value={formData.area_of_expertise}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="e.g., Cardiology, Pediatrics, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training History
                    </label>
                    <textarea
                      name="training_history"
                      value={formData.training_history}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Describe your training and experience"
                    />
                  </div>
                </>
              )}

              {/* Admin-specific fields */}
              {selectedUserType === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    name="admin_username"
                    required
                    value={formData.admin_username}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      usernameAvailable === true
                        ? "border-green-500"
                        : usernameAvailable === false
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter admin username"
                  />
                  {checkingUsername && (
                    <p className="text-xs text-gray-500 mt-1">
                      Checking availability...
                    </p>
                  )}
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-600 mt-1">
                      Username available!
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-600 mt-1">
                      Username not available
                    </p>
                  )}
                </div>
              )}

              {/* Email and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </motion.div>

              {/* Sign In Link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-purple-600 hover:text-pink-500 transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </motion.div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
