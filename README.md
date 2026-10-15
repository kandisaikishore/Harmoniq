# Harmoniq 🎵
### AI Music Theory & Visualization Studio

Harmoniq is an interactive music-theory workspace for exploring scales, chords, harmony, and musical relationships. It brings visual learning tools together with an AI-powered music mentor to help musicians, songwriters, guitarists, and producers understand theory and apply it creatively.

[**View the repository →**](https://github.com/kandisaikishore/Harmoniq)

## ✨ Features

- **Scale and chord explorer** — choose a root note and a scale or chord type to inspect its notes and interval formula.
- **Interactive piano keyboard** — visualize selected pitches on a piano.
- **Guitar and bass fretboard** — explore note patterns and fretboard relationships.
- **Circle of fifths** — understand key relationships and harmonic movement.
- **Staff visualization** — connect music-theory concepts to written notation.
- **AI harmony mentor** — ask theory questions with role-focused guidance for harmony, fretboard technique, music production, and songwriting.
- **Natural-language music queries** — describe a scale or chord you want to explore and load it into the visualizer.
- **Music image studio** — generate music-related visual material through the server-side Gemini API integration.
- **Theory reference library** — browse music-theory concepts and load supported examples into the visualizer.
- **Saved progressions** — access the app's saved-progression experience.
- **Firebase integration** — the project includes Firebase configuration and Firestore security rules.

> AI-powered features require a valid Gemini API key on the server. Model availability and usage are subject to your Google AI/Gemini account and API configuration.

## 🧰 Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 |
| Icons and motion | Lucide React, Motion |
| Backend | Node.js, Express, TypeScript |
| AI integration | Google GenAI SDK (Gemini) |
| Authentication / data services | Firebase |
| Package manager lockfile | Bun |

## 📁 Project Structure

```text
Harmoniq/
├── src/
│   ├── components/        # Visualizer, chat, image studio, library, saved UI
│   ├── context/           # React application context, including authentication
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Music-theory utilities
│   ├── App.tsx             # Main application and view coordination
│   ├── firebase.ts         # Firebase initialization
│   ├── index.css           # Global styles
│   └── main.tsx             # Frontend entry point
├── server.ts               # Express server and AI API endpoints
├── index.html              # Vite HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── firestore.rules          # Firestore security rules
├── firebase-blueprint.json  # Firebase project blueprint
├── .env.example             # Environment variable template
└── package.json             # Scripts and dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js compatible with the versions required by the installed Vite and TypeScript dependencies
- Bun (recommended, because the repository includes `bun.lock`), or another compatible package manager
- A Gemini API key for AI endpoints
- Firebase configuration/credentials if you intend to use Firebase-backed features

### 1. Clone the repository

```bash
git clone https://github.com/kandisaikishore/Harmoniq.git
cd Harmoniq
```

### 2. Install dependencies

Using Bun:

```bash
bun install
```

Alternatively, with npm:

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and set the values required for your environment.

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

- **`GEMINI_API_KEY`** — used by the server for Gemini-powered chat, music-query parsing, and image-generation features.
- **`APP_URL`** — the hosted application URL used where the server needs to refer to its own deployment.

Keep real API keys and credentials private. Never commit your `.env` file or expose server secrets in frontend code. Use your hosting provider's secret/environment-variable settings in production.

### 4. Run the application locally

The development script starts the TypeScript server:

```bash
bun run dev
```

The project scripts also include:

```bash
bun run build
bun run lint
bun run preview
```

- `build` creates the production frontend bundle with Vite.
- `lint` runs the TypeScript compiler in no-emit mode.
- `preview` starts Vite's preview server for a built frontend; run it after building.
- `dev` starts the Express/Vite development server.

For a production deployment, configure the host to build the frontend and start the Express server using a supported Node.js runtime. Confirm the host's start command and TypeScript execution/build strategy before deploying.

## 🔐 Configuration and Security

- Store `GEMINI_API_KEY` as a server-side environment variable or secret.
- Configure Firebase values and authorized services for your own Firebase project before enabling Firebase-backed functionality.
- Review `firestore.rules` before deploying, and validate the rules against the application's actual data access patterns.
- Restrict API usage as appropriate for your app, and configure quotas and billing in the corresponding provider console.
- Do not treat `.env.example` placeholder values as working credentials.

## 🧪 Quality Checks

Before submitting changes or deploying, run:

```bash
bun install
bun run lint
bun run build
```

Also test the core workflows in a browser: scale and chord selection, piano/fretboard/staff views, Circle of Fifths navigation, natural-language query parsing, AI chat, image generation, authentication, and saved progressions. AI and Firebase workflows need their corresponding credentials and services to be configured.

## 🗺️ Roadmap Ideas

- Add unit and integration tests for music-theory calculations and API routes.
- Add automated CI checks for type-checking and production builds.
- Improve accessibility and keyboard navigation across the visualizers.
- Document deployment targets and Firebase setup with environment-specific examples.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a focused feature branch.
3. Make your changes and run the quality checks.
4. Open a pull request with a clear description and test notes.

## 📄 License

No license file was identified in the repository when this README was prepared. Unless a license is added, assume that the project is not offered under an open-source license and that normal copyright restrictions apply.

---

**Harmoniq** — explore music theory, visualize harmony, and turn ideas into sound.
