# Smart Water Frontend

A React-based dashboard for smart water management, providing real-time monitoring and visualization of water levels, usage, and tap interactions.

## Overview

This frontend application connects to a backend API to display live data from ESP32 devices via ThingSpeak. It features interactive charts, usage summaries, and controls for managing water taps and readings.

## Features

- **Live Chart**: Real-time visualization of water levels (cm) and volume (L) using Chart.js
- **Usage Summary**: Overview of water consumption and statistics
- **Tap Usage Card**: Display and control tap usage data
- **Latest Reading Card**: Most recent sensor readings
- **Bluetooth Reader**: Interface for Bluetooth-connected devices
- **Responsive Design**: Mobile-friendly dashboard layout

## Tech Stack

- **React** 19.2.0 - Frontend framework
- **Chart.js** 4.5.1 - Chart visualization
- **Axios** 1.13.2 - HTTP client for API calls
- **Day.js** 1.11.19 - Date/time manipulation
- **React Scripts** 5.0.1 - Build and development tools

## Installation

1. Ensure you have Node.js (v14 or higher) installed
2. Navigate to the project directory:
   ```bash
   cd Smartwaterfrontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory to configure the backend API URL:

```
REACT_APP_API_BASE=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## Usage

### Development

Start the development server:

```bash
npm start
```

The app will run on `http://localhost:3000` by default.

### Production Build

Create a production build:

```bash
npm run build
```

### Testing

Run tests:

```bash
npm test
```

## API Integration

The frontend communicates with a backend API that provides:

- `/api/reads/recent` - Recent water level and volume readings
- Tap usage data
- ThingSpeak integration endpoints

Ensure the backend server is running and accessible at the configured API base URL.

## Project Structure

```
Smartwaterfrontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration
│   ├── components/     # React components
│   │   ├── ThingSpeakChart.js
│   │   ├── UsageSummary.js
│   │   ├── TapUsageCard.js
│   │   ├── LatestReadingCard.js
│   │   └── BluetoothReader.js
│   ├── App.js          # Main app component
│   └── index.js        # App entry point
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure everything works
5. Submit a pull request

## License

This project is part of the Smart Water Management system. See the main project repository for licensing information.
