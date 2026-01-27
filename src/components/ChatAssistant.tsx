import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, User, Bot } from 'lucide-react';

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
        content: `Hello! 👋 Welcome to SmopfAIr assistant for ${shopData.shop_name}! 

I'm here to help you with:
• Adding and managing products
• Understanding analytics and reports  
• Using SmopfAIr features effectively
• Answering questions about your ${shopData.business_type.toLowerCase()}

What would you like to know?`,
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
        response = `� **Sales Update (Today):**\n\nYou have sold **${totalItems} items** today, generating **₹${totalRevenue.toFixed(2)}** in revenue.\n\nKeep it up! 🚀`;
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
      response = `� **Notifications:**\n\nI'll notify you about:\n• Low stock alerts\n• Daily sales summaries\n• Profit opportunities\n\nCheck the bell icon in the top right!`;
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
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-110 group"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Need help? Chat with AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-blue-100">SmopfAIr Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {message.type === 'user' ?
                    <User className="w-4 h-4" /> :
                    <Bot className="w-4 h-4" />
                  }
                </div>

                <div className={`flex-1 max-w-xs ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
                    }`}>
                    <div className="text-sm whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(suggestion)}
                          className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
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
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about SmopfAIr..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <button
                onClick={handleVoiceToggle}
                className={`p-2 rounded-full transition ${isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title="Voice input (coming soon)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center mt-2">
              <p className="text-xs text-gray-400">
                AI Assistant • Voice support coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}