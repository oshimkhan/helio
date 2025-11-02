"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Shield, 
  Activity, 
  Bell, 
  MessageCircle, 
  Sparkles, 
  FileText,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Heart,
  Stethoscope,
  TrendingUp,
  Zap
} from "lucide-react";

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure Health Records",
      description: "Your medical data is encrypted and securely stored in the cloud, accessible only to you and your authorized healthcare providers.",
      color: "purple"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track vital signs, medication schedules, and health metrics in real-time with accurate and user-friendly visualizations.",
      color: "blue"
    },
    {
      icon: Bell,
      title: "Timely Notifications",
      description: "Get alerts for medication reminders, appointment schedules, and critical health changes that require attention.",
      color: "red"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Communicate directly with your healthcare providers through secure messaging for quick consultations and follow-ups.",
      color: "green"
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Receive tailored health insights and recommendations based on your health data and medical history.",
      color: "yellow"
    },
    {
      icon: FileText,
      title: "Medical History",
      description: "Access and manage your complete medical history, including diagnoses, treatments, medications, and test results.",
      color: "indigo"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3" 
            : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <motion.a 
              href="/" 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent ${
                isScrolled ? "text-transparent" : ""
              }`}>
                Healio
              </span>
            </motion.a>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/packages" className={`${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'} transition-colors font-medium`}>
                Packages
              </a>
              <a href="#" className={`${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'} transition-colors font-medium`}>
                Doctors
              </a>
              <a href="#" className={`${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'} transition-colors font-medium`}>
                Achievements
              </a>
              <a href="#" className={`${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'} transition-colors font-medium`}>
                Statistics
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Login
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 space-y-2"
            >
              <a href="/packages" className="block py-2 text-gray-700 hover:text-purple-600">Packages</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Doctors</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Achievements</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Statistics</a>
              <a href="/login" className="block py-2 text-purple-600 font-semibold">Login</a>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white flex items-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
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

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-20">
            {/* Text Content */}
            <motion.div
              className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4"
              >
                <Zap className="w-4 h-4" />
                <span>AI-Powered Health Insights</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Your Health Journey,
                <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Simplified & Enhanced
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-purple-100 max-w-2xl">
                Track, monitor, and improve your health with cutting-edge technology and personalized care plans designed for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <motion.a
                  href="/signup"
                  className="group relative px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center space-x-2 group-hover:text-white transition-colors">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
                
                <motion.a
                  href="/packages"
                  className="px-8 py-4 border-2 border-white/30 backdrop-blur-sm bg-white/10 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Packages
                </motion.a>
              </div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 pt-8 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-purple-200">Active Users</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-purple-200">Doctors</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-purple-200">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Modern Visual Design */}
            <motion.div
              className="lg:w-1/2 relative flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full max-w-lg">
                {/* Animated Gradient Orbs */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-96 h-96 bg-gradient-to-br from-yellow-400/30 via-pink-400/30 to-purple-400/30 rounded-full blur-3xl" />
                </motion.div>

                {/* Central Icon Grid */}
                <div className="relative grid grid-cols-3 gap-6 p-8">
                  {[
                    { Icon: Activity, color: "from-green-400 to-emerald-500", delay: 0.3 },
                    { Icon: Stethoscope, color: "from-blue-400 to-cyan-500", delay: 0.4 },
                    { Icon: Heart, color: "from-pink-400 to-rose-500", delay: 0.5 },
                    { Icon: TrendingUp, color: "from-purple-400 to-indigo-500", delay: 0.6 },
                    { Icon: Shield, color: "from-yellow-400 to-orange-500", delay: 0.7 },
                    { Icon: Sparkles, color: "from-cyan-400 to-teal-500", delay: 0.8 },
                  ].map((item, idx) => {
                    const IconComponent = item.Icon;
                    return (
                      <motion.div
                        key={idx}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: item.delay }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconComponent className={`w-10 h-10 text-white`} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Floating Cards */}
                <motion.div
                  className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md text-gray-800 p-5 rounded-2xl shadow-2xl max-w-xs"
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Real-time Tracking</div>
                      <div className="text-xs text-gray-600">24/7 Health Monitoring</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-8 -right-8 bg-white/95 backdrop-blur-md text-gray-800 p-5 rounded-2xl shadow-2xl max-w-xs"
                  initial={{ opacity: 0, y: -20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Expert Doctors</div>
                      <div className="text-xs text-gray-600">Certified Professionals</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Healio? Section */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Healio?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive health monitoring system offers cutting-edge
              features designed to make healthcare more accessible, efficient, and
              personalized.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                purple: "bg-purple-100 text-purple-600",
                blue: "bg-blue-100 text-blue-600",
                red: "bg-red-100 text-red-600",
                green: "bg-green-100 text-green-600",
                yellow: "bg-yellow-100 text-yellow-600",
                indigo: "bg-indigo-100 text-indigo-600"
              };

              return (
                <motion.div
                  key={feature.title}
                  className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className={`w-16 h-16 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Health Monitoring Packages Section */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Health Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect package that suits your health monitoring needs
              and budget. All plans include 24/7 support.
            </p>

            {/* Monthly/Annual Toggle */}
            <motion.div
              className="mt-10 mb-12 flex items-center justify-center space-x-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Basic Package Card */}
            <motion.div
              className="relative bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                {["Basic health metrics monitoring", "Monthly health report", "Email support", "Limited data access", "1 user profile"].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="/packages"
                className="w-full py-4 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.a>
            </motion.div>

            {/* Standard Package Card - Featured */}
            <motion.div
              className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 rounded-3xl shadow-2xl transform md:scale-105 z-10 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                {["All Basic features", "Weekly health reports", "24/7 chat support", "Full data access", "Up to 3 user profiles"].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="/packages"
                className="w-full py-4 px-6 bg-white text-purple-600 rounded-xl font-semibold text-center hover:bg-gray-100 transition-colors shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.a>
            </motion.div>

            {/* Premium Package Card */}
            <motion.div
              className="relative bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                {["All Standard features", "Daily health insights", "Priority 24/7 support", "Video consultations (2/month)", "Up to 5 user profiles"].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="/packages"
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.a>
            </motion.div>
          </div>

          {/* Enterprise Button */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.a
              href="#contact"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Need a custom solution for your organization?</span>
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <p className="mt-4 text-gray-600">Contact Us for Enterprise Plans</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-12 px-4 md:px-8">
        <div className="container mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Logo & Description */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white">Healio</h4>
              </motion.div>
              <p className="text-gray-400 text-sm max-w-md">
                Leading health monitoring system connecting patients with healthcare providers.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                { name: "LinkedIn", href: "#", icon: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5 1.11-2.5 2.48-2.5 2.48 1.119 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0H7.943v16h3.982v-6.57c0-3.668 4.775-4 4.775 0v6.57h3.982v-8.359c0-6.281-3.095-8.34-7.819-8.34-3.42 0-5.336 1.914-6.225 3.548h-.02v-3.089h-4.017c.059 1.218 0 16 0 16h4.017v-5.65c0-1.038.035-2.068.189-2.848.417-2.091 2.037-3.583 4.389-3.583 3.415 0 4.935 2.37 4.935 5.77v7.411h3.983z" }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-500 flex items-center justify-center transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-500">© 2024 Healio. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 text-gray-400">
              <a href="https://rahul-yadav.com.np/" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                Rahul Yadav
              </a>
              <span className="text-gray-600">•</span>
              <span>Aashish Mahato</span>
              <span className="text-gray-600">•</span>
              <span>Oshim Pathan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
