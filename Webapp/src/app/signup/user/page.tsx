"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { countries } from "@/utils/countries";
import { generatePatientId, assignDoctorToPatient } from "@/lib/utils";

export default function UserSignup() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    country: "",
    user_contact: "",
    emergency_contact: "",
    medical_history: "",
    address: "",
  });
  const [userContactCode, setUserContactCode] = useState("");
  const [emergencyContactCode, setEmergencyContactCode] = useState("");

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.country
      );
      if (selectedCountry) {
        setUserContactCode(selectedCountry.phone_code);
        setEmergencyContactCode(selectedCountry.phone_code);
      }
    }
  }, [formData.country]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: "user" | "emergency"
  ) => {
    const { value } = e.target;
    if (field === "user") {
      setUserContactCode(value);
    } else {
      setEmergencyContactCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupSuccess(false);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Generate a unique patient ID
        const patientId = await generatePatientId(supabase, formData.country);
        
        // Insert user data into the users table
        const { error: insertError } = await supabase.from("users").insert([
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

        if (insertError) throw insertError;

        // Automatically assign a doctor to the new patient
        if (patientId) {
          await assignDoctorToPatient(supabase, patientId);
        }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h1>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {signupSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-center">
              Account created successfully! Redirecting to login...
            </div>
          )}

          {!signupSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter your middle name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    aria-label="Select Gender"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    aria-label="Select Country"
                  >
                    <option value="">Select Country</option>
                    {countries.map(
                      (country: {
                        code: string;
                        name: string;
                        phone_code: string;
                      }) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="flex">
                    <select
                      value={userContactCode}
                      onChange={(e) => handleCountryCodeChange(e, "user")}
                      className="flex-shrink-0 mr-2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-1/4"
                      aria-label="Select User Contact Country Code"
                    >
                      {countries.map(
                        (country: {
                          code: string;
                          name: string;
                          phone_code: string;
                        }) => (
                          <option key={country.code} value={country.phone_code}>
                            {country.name} ({country.phone_code})
                          </option>
                        )
                      )}
                    </select>
                    <input
                      type="tel"
                      name="user_contact"
                      required
                      value={formData.user_contact}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-3/4"
                      placeholder="e.g., 1234567890"
                      aria-label="User Contact Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact *
                  </label>
                  <div className="flex">
                    <select
                      value={emergencyContactCode}
                      onChange={(e) => handleCountryCodeChange(e, "emergency")}
                      className="flex-shrink-0 mr-2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-1/4"
                      aria-label="Select Emergency Contact Country Code"
                    >
                      {countries.map(
                        (country: {
                          code: string;
                          name: string;
                          phone_code: string;
                        }) => (
                          <option key={country.code} value={country.phone_code}>
                            {country.name} ({country.phone_code})
                          </option>
                        )
                      )}
                    </select>
                    <input
                      type="tel"
                      name="emergency_contact"
                      required
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-3/4"
                      placeholder="e.g., 0987654321"
                      aria-label="Emergency Contact Number"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
