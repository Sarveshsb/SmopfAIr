import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, User, Bot, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatAssistantProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
}

export default function ChatAssistant({ shopData, products }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "How do I add products in bulk?",
    "What does low stock alert mean?",
    "How to track my daily sales?",
    "How to manage suppliers?",
    "What are the key features?",
    "How to export my data?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Hello! 👋 Welcome to SmopfAIr assistant for ${shopData.shop_name}!\n\nI'm here to help you with:\n• Adding and managing products\n• Understanding analytics and reports\n• Using SmopfAIr features effectively\n• Answering questions about your ${shopData.business_type.toLowerCase()}\n\nWhat would you like to know?`,
        timestamp: new Date(),
        suggestions: [
          "How to add products?",
          "Explain notifications",
          "Show me features",
          "Help with suppliers"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, shopData]);

  // Helper function to format message content (Markdown-like parser)
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // List items: • item or - item
      if (line.trim().startsWith('•') || line.trim().startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-2 my-1">
            <span className="text-blue-500">•</span>
            <span>{formattedLine.length > 1 ? formattedLine : line.replace(/^[•-]\s*/, '')}</span>
          </div>
        );
      }

      return <div key={i} className={`min-h-[1.2em] ${line.trim() === '' ? 'h-2' : ''}`}>{formattedLine}</div>;
    });
  };

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let suggestions: string[] = [];

    // Helper to get fresh data
    const getTransactions = () => {
      const saved = localStorage.getItem(`transactions_${shopData.shop_name}`);
      return saved ? JSON.parse(saved) : [];
    };

    // 1. Sales & Revenue Context
    if (lowerMessage.includes('sell') || lowerMessage.includes('sales') || lowerMessage.includes('revenue') || lowerMessage.includes('profit') || lowerMessage.includes('money')) {
      const transactions: any[] = getTransactions();
      const today = new Date().toDateString();
      const todaySales = transactions.filter((t: any) => new Date(t.date).toDateString() === today);
      const totalRevenue = todaySales.reduce((sum: number, t: any) => sum + t.revenue, 0);
      const totalItems = todaySales.reduce((sum: number, t: any) => sum + t.quantity, 0);

      if (lowerMessage.includes('today')) {
        response = `💰 **Sales Update (Today):**\n\nYou have sold **${totalItems} items** today, generating **₹${totalRevenue.toFixed(2)}** in revenue.\n\nKeep it up! 🚀`;
      } else {
        const allRevenue = transactions.reduce((sum: number, t: any) => sum + t.revenue, 0);
        response = `📊 **Business Performance:**\n\n• **Total Revenue (All Time):** ₹${allRevenue.toFixed(2)}\n• **Today's Revenue:** ₹${totalRevenue.toFixed(2)}\n\nCheck the **Analytics** tab for detailed charts!`;
      }
      suggestions = ["Show me today's sales", "What is my total revenue?", "Best selling product?"];
    }

    // 2. Product & Stock Context
    else if (lowerMessage.includes('product') || lowerMessage.includes('stock') || lowerMessage.includes('inventory') || lowerMessage.includes('bestseller') || lowerMessage.includes('best seller')) {
      if (lowerMessage.includes('low') || lowerMessage.includes('alert')) {
        const lowStock = products.filter(p => p.quantity_on_hand <= p.reorder_level);
        response = `⚠️ **Low Stock Alert:**\n\nYou have **${lowStock.length} products** running low on stock.\n${lowStock.length > 0 ? `Example: ${lowStock[0].product_name} (${lowStock[0].quantity_on_hand} left).` : 'Everything looks good!'} \n\nCheck **Insights** for the full list.`;
        suggestions = ["Reorder products", "View inventory"];
      } else if (lowerMessage.includes('best') || lowerMessage.includes('top')) {
        const transactions: any[] = getTransactions();
        const salesMap = new Map<string, number>();
        transactions.forEach((t: any) => salesMap.set(t.productName, (salesMap.get(t.productName) || 0) + t.quantity));
        const sorted = Array.from(salesMap.entries()).sort((a, b) => b[1] - a[1]);

        if (sorted.length > 0) {
          response = `🏆 **Best Seller:**\n\nYour top product is **${sorted[0][0]}** with **${sorted[0][1]} units** sold!\n\nUse this insight to plan your next restocking.`;
        } else {
          response = "I need more sales data to determine your best seller. Start recording transactions!";
        }
        suggestions = ["Show revenue", "Low stock items"];
      } else {
        response = `📦 **Inventory Status:**\n\nYou currently have **${products.length} unique products** in your inventory.\n\nNeed to add more? Go to the **Products** tab.`;
        suggestions = ["How to bulk upload?", "What is dead stock?", "Add new product"];
      }
    }

    // 3. Help & Features
    else if (lowerMessage.includes('notification') || lowerMessage.includes('alert')) {
      response = `🔔 **Notifications:**\n\nI'll notify you about:\n• Low stock alerts\n• Daily sales summaries\n• Profit opportunities\n\nCheck the bell icon in the top right!`;
      suggestions = ["Check stock", "Show analytics"];
    }

    // 4. Greeting / General
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = `Hello! 👋 I'm your **SmopfAIr Assistant**.\n\nAsk me about your **sales, inventory, or suppliers**. I can analyze your data in real-time!`;
      suggestions = ["How much did I sell today?", "What is low stock?", "Who is my best supplier?"];
    }

    // Default Fallback
    else {
      response = `🤔 **I can help with that!**\n\nTry asking me about:\n\n• **"Sales today"**\n• **"Low stock items"**\n• **"Best selling product"**\n• **"Total revenue"**\n\nI'm connected to your shop's live data!`;
      suggestions = ["Sales today", "Inventory status", "Supplier help"];
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  };

  const sendMessage = (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate AI response after a short delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageContent);
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice functionality would be implemented here
    setTimeout(() => setIsListening(false), 3000); // Auto-stop after 3 seconds for demo
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="glass-dark p-4 rounded-full hover:scale-110 transition-all duration-300 group relative border-white/20 bg-indigo-600/80 hover:bg-indigo-600"
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <MessageCircle className="w-6 h-6 text-white relative z-10" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-slate-900 z-10"></div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 hidden group-hover:block w-48">
            <div className="glass-dark text-xs px-3 py-2 rounded-xl backdrop-blur-md">
              Chat with AI Assistant
            </div>
          </div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-6 w-[90vw] md:w-96 h-[550px] max-h-[70vh] glass flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md p-4 flex items-center justify-between rounded-t-2xl border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide">SmopfAIr AI</h3>
                <p className="text-xs text-blue-100/80 font-medium">Always online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/40 ${message.type === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  : 'bg-white/80 text-indigo-600 backdrop-blur-sm'
                  }`}>
                  {message.type === 'user' ?
                    <User className="w-4 h-4" /> :
                    <Bot className="w-4 h-4" />
                  }
                </div>

                <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3.5 rounded-2xl shadow-sm backdrop-blur-sm ${message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-white/60 border border-white/40 text-gray-800 rounded-bl-sm'
                    }`}>
                    <div className="text-sm leading-relaxed text-left">
                      {formatMessage(message.content)}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2 animate-in fade-in duration-500 slide-in-from-left-2">
                      <p className="text-xs text-gray-500 font-medium ml-1">Suggested:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(suggestion)}
                          className="block w-full text-left text-xs bg-white/40 hover:bg-white/80 active:bg-blue-50 text-indigo-700 px-3 py-2 rounded-xl border border-white/40 shadow-sm transition-all duration-200"
                        >
                          ✨ {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] text-gray-400 mt-1 px-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t border-white/20 bg-white/10 backdrop-blur-md">
              <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Quick actions</p>
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                {quickQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="flex-shrink-0 text-xs bg-white/50 hover:bg-white text-gray-700 px-3 py-1.5 rounded-full border border-white/40 shadow-sm transition whitespace-nowrap"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-xl rounded-b-2xl safe-bottom">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask SmopfAIr..."
                  className="w-full pl-4 pr-10 py-3 bg-white/50 border border-white/30 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none text-sm placeholder-gray-500 shadow-inner"
                />
              </div>

              <button
                onClick={handleVoiceToggle}
                className={`p-3 rounded-full transition-all duration-200 ${isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-200'
                  : 'bg-white/50 text-gray-600 hover:bg-white border border-white/30'
                  }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}