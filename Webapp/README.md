# Healio Web Application

Frontend web application for the Healio Health Monitoring System, built with Next.js 15.

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── page.tsx      # Landing page
│   ├── login/        # Authentication
│   ├── signup/       # Registration
│   └── dashboard/    # User dashboards
├── components/       # Reusable UI components
├── lib/             # Utilities and helpers
└── utils/           # Helper functions
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

For detailed documentation, see the main [README.md](../README.md) in the root directory.
