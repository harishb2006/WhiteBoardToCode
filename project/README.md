# Whiteboard to Code - AI-Powered Component Generator

Transform your whiteboard drawings into React components using Google's Gemini AI!

## Features

- **Interactive Whiteboard**: Draw shapes, add text, and create layouts
- **AI Code Generation**: Convert drawings to React TypeScript components
- **Gemini Integration**: Powered by Google's Gemini AI API
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Instant Preview**: See generated code with syntax highlighting

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. API Key Setup

You'll need a Google Gemini API key to use the AI features:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Either:
   - Copy `.env.example` to `.env` and add your key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - Or enter it in the app when prompted

### 3. Run the Application

```bash
npm run dev
```

## How to Use

1. **Draw on the Whiteboard**:
   - Use the pen tool to draw freely
   - Add rectangles and circles for UI elements
   - Add text for labels and content
   - Use the select tool to interact with elements

2. **Generate Code**:
   - Click the sparkle ⨯ button to generate code
   - Enter your API key if prompted
   - Wait for the AI to analyze your drawing

3. **View and Use the Code**:
   - Generated code appears in the right panel
   - Copy or download the component
   - Use it in your React projects

## Drawing Tips for Better AI Results

- **Be Clear**: Use simple, recognizable shapes
- **Add Context**: Include text labels to describe functionality
- **Think Layout**: Organize elements to show the intended structure
- **Use Conventions**: 
  - Rectangles for buttons, cards, containers
  - Circles for avatars, icons, badges
  - Text for headings, labels, content

## Examples

### Button Component
- Draw a rectangle
- Add text inside it like "Submit" or "Click me"
- AI will generate a styled button component

### Card Layout
- Draw rectangles for containers
- Add text for headings and content
- AI will create a card component with proper styling

### Navigation
- Draw horizontal rectangles or lines
- Add text for menu items
- AI will generate navigation components

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas API
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key (optional, can be entered in app)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning and development!
