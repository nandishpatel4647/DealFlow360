import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  MessageSquare,
  Search,
  Send,
  Building,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Mail,
  User,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '../design-system/StatusBadge';

export const MessagesView: React.FC = () => {
  const {
    quotes,
    messages,
    sendMessage,
    currentUser,
    userRole,
    companies,
    selectedQuoteId,
    setSelectedQuoteId,
    setActiveView,
    customerAssignments,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Initial selected company: if selectedQuoteId matches a company, select that; otherwise first company with messages or first company
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    if (selectedQuoteId) {
      const q = quotes.find((quote) => quote.id === selectedQuoteId);
      if (q) return q.companyId;
    }
    const compWithMsg = companies.find((c) =>
      messages.some((m) => m.companyId === c.id || quotes.some((q) => q.companyId === c.id && q.id === m.quoteId))
    );
    return compWithMsg ? compWithMsg.id : companies[0]?.id || '';
  });

  const [replyText, setReplyText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Group messages strictly PER COMPANY (Exactly 1 thread per customer company!)
  const companyThreads = useMemo(() => {
    return companies.map((comp) => {
      // Find all quotes belonging to this company
      const compQuotes = quotes.filter(
        (q) => q.companyId === comp.id || q.companyName.toLowerCase().includes(comp.name.toLowerCase())
      );
      const quoteIds = new Set(compQuotes.map((q) => q.id));

      // Match all messages for this company (by companyId or by any of its quoteIds)
      const compMessages = messages.filter(
        (m) => (m.companyId && m.companyId === comp.id) || quoteIds.has(m.quoteId)
      );

      const lastMsg = compMessages[compMessages.length - 1] || null;
      const assignedRepEmail = customerAssignments[comp.id];

      return {
        company: comp,
        quotes: compQuotes,
        messages: compMessages,
        messagesCount: compMessages.length,
        lastMessage: lastMsg,
        assignedRepEmail,
      };
    });
  }, [companies, quotes, messages, customerAssignments]);

  // Filter company threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return companyThreads;
    const q = searchQuery.toLowerCase();
    return companyThreads.filter(
      (t) =>
        t.company.name.toLowerCase().includes(q) ||
        t.company.industry.toLowerCase().includes(q) ||
        t.company.contactPerson?.toLowerCase().includes(q) ||
        t.lastMessage?.text.toLowerCase().includes(q) ||
        t.quotes.some((quote) => quote.id.toLowerCase().includes(q))
    );
  }, [companyThreads, searchQuery]);

  // Currently active company thread
  const currentThread =
    companyThreads.find((t) => t.company.id === selectedCompanyId) || companyThreads[0] || null;

  // Auto-scroll to bottom of chat when new messages arrive or thread changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !currentThread) return;

    const senderRole = userRole === 'sales_manager' ? 'manager' : userRole === 'admin' ? 'manager' : 'rep';
    const senderTitle =
      currentUser?.name ||
      (userRole === 'sales_manager'
        ? 'M. Shah (Sales Manager)'
        : userRole === 'admin'
        ? 'System Administrator'
        : 'P. Mehta (Sales Rep)');

    // Use primary active quote if available, or first quote of this company
    const primaryQuote = currentThread.quotes[0];
    const targetQuoteId = primaryQuote ? primaryQuote.id : `COMP-${currentThread.company.id}`;

    sendMessage(
      targetQuoteId,
      replyText.trim(),
      senderRole,
      senderTitle,
      currentThread.company.id
    );

    setReplyText('');
  };

  const handleQuickTemplate = (text: string) => {
    setReplyText(text);
  };

  const tierColors: Record<string, string> = {
    Platinum: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Gold: 'bg-amber-50 text-amber-700 border-amber-200',
    Silver: 'bg-slate-100 text-slate-700 border-slate-300',
    Bronze: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-blue-50 text-[#0176D3]">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Customer Messages & Collaboration Hub
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Direct live communication threads organized strictly per customer account. Synchronized in real time with Customer Portals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" />
              {companies.length} Customer Accounts
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0176D3] text-xs font-bold border border-blue-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#0176D3]" />
              {messages.length} Total Messages
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Company Accounts (1 Chat per Customer) | Right Live Chat Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left Pane: Customer Companies List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by company name, contact, industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0176D3]"
              />
            </div>
          </div>

          {/* Customer Threads List (1 per company) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No customer account found matching "{searchQuery}".
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.company.id === currentThread?.company.id;
                return (
                  <button
                    key={t.company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(t.company.id)}
                    className={`w-full p-4 text-left transition flex flex-col gap-2 cursor-pointer border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-[#0176D3]'
                        : 'hover:bg-slate-50/80 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {t.company.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {t.company.industry}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {t.quotes.length} Quotation{t.quotes.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                          tierColors[t.company.tierId] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.company.tierId}
                      </span>
                    </div>

                    {/* Last message preview */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      <p className="truncate italic text-slate-600 max-w-[210px]">
                        {t.lastMessage ? (
                          <>
                            <strong className="font-semibold text-slate-700 not-italic">
                              {t.lastMessage.sender === 'customer' ? 'Customer' : 'Sales Team'}:
                            </strong>{' '}
                            {t.lastMessage.text}
                          </>
                        ) : (
                          <span className="text-slate-400 not-italic">No conversation yet</span>
                        )}
                      </p>

                      {t.messagesCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#0176D3] text-white font-bold text-[10px]">
                          {t.messagesCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">0</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Company Conversation Thread (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {currentThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0176D3] flex items-center justify-center font-bold">
                    <Building className="w-5 h-5 text-[#0176D3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {currentThread.company.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          tierColors[currentThread.company.tierId] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {currentThread.company.tierId} Tier
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {currentThread.company.contactPerson || 'Procurement Desk'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {currentThread.company.contactEmail}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Associated Quotations Links */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {currentThread.quotes.slice(0, 3).map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuoteId(q.id);
                        setActiveView('builder');
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-700 hover:text-[#0176D3] border border-slate-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      title={`Open ${q.id} in Quote Builder`}
                    >
                      <ExternalLink className="w-3 h-3 text-[#0176D3]" />
                      {q.id} ({q.status})
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                {currentThread.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">No conversation history with {currentThread.company.name} yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Start direct collaboration regarding active quotations, commercial proposals, or fulfillment inquiries using the reply box below.
                    </p>
                  </div>
                ) : (
                  currentThread.messages.map((msg) => {
                    const isInternal = msg.sender === 'rep' || msg.sender === 'manager' || msg.sender === 'system';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInternal ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {msg.senderName}
                          </span>
                          {msg.quoteId && msg.quoteId !== 'General' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-medium">
                              {msg.quoteId}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {msg.timestamp}
                          </span>
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-xl text-xs font-medium leading-relaxed shadow-2xs ${
                            isInternal
                              ? 'bg-[#0176D3] text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Replies:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTemplate(
                      `Hello ${currentThread.company.contactPerson || currentThread.company.name}! We have reviewed your counter-proposal and applied the requested discount concessions.`
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0176D3] hover:text-[#0176D3] text-slate-600 transition shrink-0 cursor-pointer"
                >
                  Concessions Applied
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTemplate(
                      'Thank you for your response. Delivery timeline and stock allocation have been confirmed with central warehouse logistics.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0176D3] hover:text-[#0176D3] text-slate-600 transition shrink-0 cursor-pointer"
                >
                  Delivery Confirmed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTemplate(
                      'Please review the updated formal quotation terms directly in your customer portal and confirm whenever ready.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0176D3] hover:text-[#0176D3] text-slate-600 transition shrink-0 cursor-pointer"
                >
                  Portal Review Ready
                </button>
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Send direct message to ${currentThread.company.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-3 rounded-lg bg-[#0176D3] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
              <Building className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs">No customer account selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
