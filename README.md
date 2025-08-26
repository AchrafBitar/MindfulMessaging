# 🧠 Mindful Messaging Assistant

An AI-powered browser extension and desktop app that helps you communicate more mindfully by analyzing messages and suggesting contextual replies.

## ✨ Features

### 🤖 AI-Powered Analysis
- **Sentiment Detection**: Understand the emotional tone of messages
- **Intent Recognition**: Identify questions, requests, complaints, and more
- **Entity Extraction**: Automatically detect people, dates, and locations
- **Risk Assessment**: Flag urgent or concerning messages
- **Smart Reply Generation**: Context-aware response suggestions

### 🌐 Multi-Platform Support
- **WhatsApp Web** - Analyze chat messages and conversations
- **Facebook Messenger** - Extract insights from messenger conversations
- **Gmail** - Analyze email content and tone
- **Slack** - Process team messages and discussions
- **Telegram Web** - Analyze telegram conversations

### 🎨 Modern UI
- **Dark/Light Mode**: Toggle between themes
- **Expandable Cards**: Click to see detailed insights
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Instant analysis results
- **Copy-to-Clipboard**: One-click reply copying

### 🔒 Privacy-First
- **On-Device Processing**: Desktop app processes everything locally
- **Optional Cloud AI**: Browser extension can use Hugging Face API
- **No Data Storage**: Messages are analyzed but not stored
- **Secure API Keys**: Encrypted storage of API credentials

## 🚀 Quick Start

### Desktop App (Recommended)

1. **Install Dependencies**
   ```bash
   cd mindful-messaging
   pnpm install
   ```

2. **Start Development**
   ```bash
   pnpm dev
   ```

3. **Use the App**
   - Press `Cmd/Ctrl+Shift+M` to open the window
   - Paste text or use clipboard integration
   - Get instant AI analysis and reply suggestions

### Browser Extension

1. **Build the Extension**
   ```bash
   # From the root directory
   pnpm --filter extension build
   
   # Or from the extension directory
   cd apps/extension
   pnpm build
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select `apps/extension/dist`

3. **Configure AI (Optional)**
   - Get a free Hugging Face API key from [huggingface.co](https://huggingface.co/settings/tokens)
   - Right-click the extension icon and select "Options"
   - Enter your API key for enhanced AI features

## 🛠️ Development

### Project Structure
```
mindful-messaging/
├── apps/
│   ├── desktop/          # Tauri desktop app
│   ├── extension/        # Chrome extension
│   └── server/           # Future backend (placeholder)
├── packages/
│   ├── common/           # Shared types and utilities
│   └── nlp-worker/       # AI processing logic
└── README.md
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Desktop**: Tauri v2 (Rust + Web Technologies)
- **AI**: Hugging Face Transformers, transformers.js
- **Build**: Turbo (monorepo), pnpm
- **Styling**: CSS with modern gradients and animations

### Development Commands
```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Build all apps
pnpm build

# Run desktop app only
pnpm --filter desktop dev

# Build extension only
pnpm --filter extension build
```

## 🎯 Usage Examples

### Desktop App
1. **Global Hotkey**: Press `Cmd/Ctrl+Shift+M` anywhere
2. **Clipboard Integration**: Automatically reads clipboard content
3. **Manual Input**: Type or paste text directly
4. **Quick Copy**: Click any suggested reply to copy to clipboard

### Browser Extension
1. **Right-Click Analysis**: Select text and right-click "Analyze with Mindful"
2. **Auto-Detection**: Extension automatically detects new messages
3. **Popup Dashboard**: Click extension icon to see all analyses
4. **Context Menu**: Use context menu for quick analysis

## 🤖 AI Models Used

### Hugging Face Models
- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Named Entity Recognition**: `dslim/bert-base-NER`
- **Intent Detection**: `facebook/bart-large-mnli`

### Local Processing (Desktop)
- **Transformers.js**: On-device AI processing
- **Chrono**: Date parsing and extraction
- **Custom NLP Pipeline**: Task and risk detection

## 🔧 Configuration

### API Keys
The extension supports Hugging Face API for enhanced AI features:

1. **Get API Key**: Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Configure**: Right-click extension → Options → Enter API key
3. **Test**: Use the test connection feature to verify setup

### Customization
- **Theme**: Toggle dark/light mode in the popup
- **Hotkey**: Modify global shortcut in desktop app settings
- **Models**: Switch AI models in the configuration

## 📱 Supported Platforms

### Messaging Apps
- ✅ WhatsApp Web
- ✅ Facebook Messenger
- ✅ Gmail
- ✅ Slack
- ✅ Telegram Web
- 🔄 Discord (planned)
- 🔄 Microsoft Teams (planned)

### Operating Systems
- ✅ Windows
- ✅ macOS
- ✅ Linux

### Browsers
- ✅ Chrome/Chromium
- 🔄 Firefox (planned)
- 🔄 Safari (planned)

## 🧪 Testing

### Test Messages
Try these sample messages to test the AI:

**Task Detection:**
```
"I need to finish the project by Friday and send it to John Smith"
```

**Date Extraction:**
```
"Let's meet tomorrow at 3pm for the team discussion"
```

**Risk Assessment:**
```
"This is urgent - we have a problem with the deadline"
```

**Question Analysis:**
```
"Can you help me understand the new requirements?"
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Test on multiple platforms
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for providing excellent AI models
- **Tauri** for the amazing desktop app framework
- **React** and **Vite** for the modern development experience
- **Chrono** for robust date parsing

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions
- **Documentation**: Check the docs folder for detailed guides

---

**Made with ❤️ for mindful communication**
