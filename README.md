# BrowserBrain

An intelligent AI-powered browser automation agent that can open websites, perform searches, and execute tasks autonomously.

## 🚀 Features

- **Autonomous Decision Making**: Uses AI to decide whether to chat or perform browser actions
- **Browser Automation**: Opens websites and performs Google searches using Puppeteer
- **Real-time Execution**: Actions are performed immediately without user intervention
- **Conversation History**: Tracks all interactions with persistent storage
- **Modern UI**: Clean, professional interface built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenRouter API (GPT-4o-mini)
- **Browser Automation**: Puppeteer
- **Storage**: LocalStorage for history

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Rusty
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

   Get your API key from [OpenRouter](https://openrouter.ai/)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 💡 Usage

1. **Start a conversation**: Type your message in the input box
2. **Watch the AI think**: See the AI's reasoning process
3. **Automatic actions**: The agent will open websites or search when needed
4. **View history**: Check the sidebar for all your previous interactions
5. **Delete entries**: Use the delete button to remove history items

### Example Commands

- "open amazon.com" - Opens Amazon website
- "search for latest smartphones" - Performs Google search
- "what's the weather today?" - Regular chat response

## 🔧 Configuration

### API Key Setup

The app requires an OpenRouter API key for AI functionality:

1. Sign up at [OpenRouter.ai](https://openrouter.ai/)
2. Generate an API key
3. Add it to your `.env.local` file

### Production Deployment

For production:

1. Set `headless: true` in Puppeteer configuration
2. Remove debug delays
3. Deploy to Vercel, Netlify, or your preferred platform

## 📁 Project Structure

```
Rusty/
├── src/app/
│   ├── api/
│   │   ├── agent/route.ts    # Main AI agent logic
│   │   └── browser/route.ts  # Browser automation
│   ├── layout.tsx            # App layout
│   └── page.tsx              # Main UI
├── package.json
├── tailwind.config.ts
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenRouter](https://openrouter.ai/)
- Browser automation with [Puppeteer](https://pptr.dev/)

---

Made with ❤️ for smarter browser interactions