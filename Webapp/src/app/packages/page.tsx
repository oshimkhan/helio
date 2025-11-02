"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PackagesPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const basicFeatures = [
    "Basic health metrics monitoring",
    "Monthly health report",
    "Email support",
    "Limited data access",
    "1 user profile",
  ];

  const standardFeatures = [
    "All Basic features",
    "Weekly health reports",
    "24/7 chat support",
    "Full data access",
    "Up to 3 user profiles",
    "Medication management",
    "Integration with wearable devices",
  ];

  const premiumFeatures = [
    "All Standard features",
    "Daily health insights",
    "Priority 24/7 support",
    "Video consultations (2/month)",
    "Personalized health recommendations",
    "Family health dashboard",
    "Up to 5 user profiles",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Choose Your <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">Health Plan</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Select the perfect package that suits your health monitoring needs and budget.
          </motion.p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="container mx-auto">
          {/* Monthly/Annual Toggle */}
          <motion.div
            className="flex items-center justify-center space-x-4 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={`font-semibold text-lg transition-colors ${
                isAnnual ? "text-gray-400" : "text-purple-600"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </span>
            <motion.div
              className={`relative w-16 h-9 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                isAnnual ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300"
              }`}
              onClick={() => setIsAnnual(!isAnnual)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-7 h-7 bg-white rounded-full shadow-lg"
                animate={{
                  x: isAnnual ? 28 : 2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-semibold text-lg transition-colors ${
                  isAnnual ? "text-green-600" : "text-gray-400"
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
              </span>
              {isAnnual && (
                <motion.span
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Save 15%
                </motion.span>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Basic Package Card */}
            <motion.div
              className="relative bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900">Basic</h3>
                <p className="mt-2 text-gray-600">
                  Essential health monitoring for individuals.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {isAnnual ? "₹35,600" : "₹3,490"}
                  </span>
                  <span className="text-xl text-gray-500 ml-2">
                    {isAnnual ? "/year" : "/month"}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {basicFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <motion.button
                  className="w-full py-4 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>

            {/* Standard Package Card - Featured */}
            <motion.div
              className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 rounded-3xl shadow-2xl transform md:scale-105 z-10 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-6 mt-4">
                <h3 className="text-3xl font-bold text-white">Standard</h3>
                <p className="mt-2 text-purple-100">
                  Comprehensive monitoring for health-conscious individuals.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white">
                    {isAnnual ? "₹71,300" : "₹6,990"}
                  </span>
                  <span className="text-xl text-purple-200 ml-2">
                    {isAnnual ? "/year" : "/month"}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {standardFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <motion.button
                  className="w-full py-4 px-6 bg-white text-purple-600 rounded-xl font-semibold text-center hover:bg-gray-100 transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>

            {/* Premium Package Card */}
            <motion.div
              className="relative bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900">Premium</h3>
                <p className="mt-2 text-gray-600">
                  Complete health solution for families and advanced users.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {isAnnual ? "₹121,300" : "₹11,900"}
                  </span>
                  <span className="text-xl text-gray-500 ml-2">
                    {isAnnual ? "/year" : "/month"}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {premiumFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <motion.button
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Enterprise CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-gray-600 mb-4">Need a custom solution for your organization?</p>
            <Link href="#contact">
              <motion.button
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Contact Us for Enterprise Plans</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
