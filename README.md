## AI Features

This project includes enhanced AI-powered features with intelligent capabilities for writing, analysis, and problem-solving. **No API keys or external services required!**

### 🤖 **AI Features Available**:
- **AI Assistant**: Powered by Qwen2.5-1.5B-Instruct model for intelligent conversations
- **Writing Assistant**: Grammar fixing, text expansion/shortening, style improvement
- **AI Summarizer**: Smart text summarization with multiple length options

### 🚀 **How it works**:
- **AI Assistant**: Uses Qwen2.5-1.5B-Instruct model running locally in your browser
- **Other AI Features**: Enhanced algorithms with intelligent response generation
- **Fallback System**: Intelligent mock responses ensure consistent functionality
- **Offline Capable**: Works without internet connection after initial model download

### 📱 **Browser Requirements**:
- Modern browser with WebAssembly support (Chrome, Firefox, Safari, Edge)
- WebGPU support recommended for optimal AI Assistant performance
- Sufficient RAM (4GB+ recommended for Qwen model)

**Note**: The AI Assistant will automatically fallback to enhanced responses if the Qwen model fails to load, ensuring the application always works.

**Note**: Create a .env file and place your credentials 
          VITE_SUPABASE_PROJECT_ID=""
          VITE_SUPABASE_PUBLISHABLE_KEY=""
          VITE_SUPABASE_URL=""
