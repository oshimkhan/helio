<div align="center">

# 💚 Healio - Health Monitoring System

**Modern, AI-powered health monitoring platform connecting patients with healthcare providers**

[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success)](https://github.com/rahulyyadav/healthAnalysis)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

[Features](#-features) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

Healio is a comprehensive health monitoring system designed to bridge the gap between patients and healthcare providers. Built with modern web technologies, it offers real-time health tracking, AI-powered insights, and seamless communication between patients and doctors.

### 🎯 Mission

To make healthcare more accessible, efficient, and personalized through cutting-edge technology and intuitive user experience.

---

## ✨ Features

### For Patients

- 📊 **Real-time Health Monitoring** - Track vital signs and health metrics 24/7
- 📈 **AI-Powered Insights** - Receive personalized health recommendations
- 🔔 **Smart Notifications** - Get timely alerts for medications and appointments
- 📝 **Complete Medical History** - Access your health records anytime
- 💬 **Direct Doctor Communication** - Secure messaging with healthcare providers
- 🔒 **Secure Data Storage** - End-to-end encrypted health records

### For Healthcare Providers

- 👥 **Patient Management** - Comprehensive patient profiles and history
- 📋 **Health Reports** - Detailed analytics and insights
- 🔔 **Priority Notifications** - Get alerted for critical patient conditions
- 📊 **Dashboard Analytics** - Track patient trends and outcomes

### For Administrators

- 📈 **System Analytics** - Monitor platform usage and trends
- 👥 **User Management** - Manage patients, doctors, and system settings
- 📊 **Reporting Tools** - Generate comprehensive reports

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm (or yarn)
- **Python 3.8+** (for ML API server)
- **Supabase account** (for authentication and database)
- **Gemini API key** (for AI predictions, optional)
- **Twilio account** (for SMS OTP verification, optional)

### Quick Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/rahulyyadav/healthAnalysis.git
   cd healthAnalysis
   ```

2. **Run the setup script**

   **On macOS/Linux:**
   ```bash
   chmod +x setup.sh  # Only needed first time, makes script executable
   ./setup.sh
   ```

   **On Windows:**
   ```bash
   setup.bat
   ```

   This will automatically:
   - Create Python virtual environment
   - Install Python dependencies (FastAPI, uvicorn, scikit-learn, etc.)
   - Install Node.js dependencies
   - Set up everything you need

3. **Environment Setup**

   ```bash
   cd Webapp
   cp .env.example .env.local  # If .env.example exists
   ```

   Create `Webapp/.env.local` with your environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ML_API_URL=http://127.0.0.1:8000
   ```

4. **Start the development servers**

   ```bash
   npm run dev
   ```

   This starts both:
   - **Next.js frontend** on [http://localhost:3000](http://localhost:3000)
   - **ML API server** on [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Manual Setup

If you prefer to set up manually:

1. **Set up Python environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ML/requirements.txt
   ```

2. **Set up Node.js**

   ```bash
   cd Webapp
   npm install
   ```

3. **Run development servers**

   ```bash
   npm run dev  # Starts both frontend and ML API
   ```

   Or run separately:
   ```bash
   npm run dev:next  # Only Next.js
   npm run dev:api   # Only ML API
   ```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patient    │  │   Doctor     │  │    Admin     │      │
│  │   Dashboard  │  │  Dashboard   │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth + OTP  │  │   Database   │  │   Storage    │      │
│  │  (Twilio)    │  │  (PostgreSQL)│  │   (Blob)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Azure Functions (ML)                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  AI Analysis │  │  Predictions  │                        │
│  │  & Insights  │  │   Engine     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks

### Backend & Services

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth + Twilio SMS OTP
- **Cloud Functions**: Azure Functions
- **Storage**: Azure Blob Storage
- **Deployment**: [Vercel](https://vercel.com/)

### Machine Learning

- **ML Framework**: Python 3.8+, scikit-learn
- **API**: FastAPI with uvicorn
- **Model**: Custom disease prediction model (disease_model.joblib)
- **Dependencies**: See `ML/requirements.txt`

---

## 📁 Project Structure

```
healthAnalysis/
├── Webapp/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   │   ├── page.tsx   # Landing page
│   │   │   ├── login/     # Authentication pages
│   │   │   ├── signup/    # Registration pages
│   │   │   ├── dashboard/ # User dashboards
│   │   │   └── api/       # API routes
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utility functions
│   │   └── utils/         # Helper utilities
│   ├── public/            # Static assets
│   └── package.json
├── ML/                     # Machine learning models
│   ├── api.py             # FastAPI endpoint
│   └── disease_model.joblib
└── README.md
```

---

## 🎨 Features Status

| Feature             | Status         | Description                               |
| ------------------- | -------------- | ----------------------------------------- |
| Landing Page        | ✅ Complete    | Modern, responsive design with animations |
| User Authentication | ✅ Complete    | Login, Signup with OTP verification       |
| Patient Dashboard   | 🔄 In Progress | Health metrics and insights               |
| Doctor Dashboard    | 🔄 In Progress | Patient management and monitoring         |
| Admin Panel         | 🔄 In Progress | System analytics and management           |
| Health Monitoring   | ✅ Complete    | Real-time vital signs tracking            |
| AI Predictions      | 🔄 In Progress | Disease risk assessment                   |
| Notifications       | 📋 Planned     | Alerts and reminders system               |

---

## 🔐 Security

- **Encryption**: All sensitive data is encrypted at rest and in transit
- **Authentication**: Secure OTP-based authentication via Twilio
- **Authorization**: Role-based access control (Patient, Doctor, Admin)
- **Data Privacy**: HIPAA-compliant data handling practices

---

## 🤝 Contributing

We welcome contributions! However, please note that this is a proprietary project.

**How to Contribute:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Guidelines:**

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

**By contributing, you agree that your contributions will be licensed under the same proprietary license.**

---

## 📝 License

This project is proprietary software. See [LICENSE](LICENSE) file for details.

**Key Points:**

- ❌ Personal or commercial use without permission is prohibited
- ✅ Contributions through pull requests are welcome
- 📧 Contact maintainers for licensing inquiries

---

## 👥 Contributors

- **Rahul Yadav** - [@rahulyyadav](https://rahul-yadav.com.np/)
- **Aashish Mahato** - Core Developer
- **Oshim Pathan** - Core Developer

---

## 📞 Support & Contact

- 📧 **Email**: Contact through GitHub Issues
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/rahulyyadav/healthAnalysis/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/rahulyyadav/healthAnalysis/discussions)

---

## 🗺️ Roadmap

- [ ] Complete patient dashboard with full analytics
- [ ] Doctor dashboard with patient management
- [ ] Admin panel with system-wide analytics
- [ ] Mobile app (React Native)
- [ ] Advanced AI predictions with more disease models
- [ ] Integration with wearable devices
- [ ] Telehealth video consultations
- [ ] Multi-language support

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- The open-source community for inspiration and tools

---

<div align="center">

**Made with ❤️ by the Healio Team**

⭐ Star us on GitHub if you find this project interesting!

</div>
