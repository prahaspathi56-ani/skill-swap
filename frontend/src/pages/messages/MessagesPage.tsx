import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  Video,
  Clock,
  Shield,
  MoreVertical,
  Paperclip,
  Check,
  CheckCheck,
  GraduationCap,
  Calendar,
  X,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('id');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // 1. Fetch conversations list
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await api.get<any[]>('/conversations');
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setSearchParams({ id: data[0].id });
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConvs(false);
      }
    };

    fetchConvs();
  }, []);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    const conv = conversations.find((c) => c.id === activeConvId);
    setActiveConversation(conv || null);

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const msgs = await api.get<any[]>(`/conversations/${activeConvId}/messages`);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join Socket conversation room
    socket.emit('join_conversation', activeConvId);

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.isTyping && data.userId !== user?.id) {
        setPartnerTyping(data.userName || 'Student is typing...');
      } else {
        setPartnerTyping(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.emit('leave_conversation', activeConvId);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [activeConvId, conversations]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const content = newMessage.trim();
    setNewMessage('');
    socket.emit('typing_stop', { conversationId: activeConvId, userId: user?.id });

    try {
      const sent = await api.post<any>(`/conversations/${activeConvId}/messages`, { content });
      setMessages((prev) => [...prev, sent]);

      // Update conversations preview
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, lastMessage: sent } : c))
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeConvId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', {
        conversationId: activeConvId,
        userId: user?.id,
        userName: user?.name,
      });
    }

    // Reset after pause
    setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId: activeConvId, userId: user?.id });
    }, 1800);
  };

  const otherUser = activeConversation?.otherUser;

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* 1. Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            Messages
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {conversations.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingConvs ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. When you or another student accept a skill swap, your chat will show up here!
            </div>
          ) : (
            conversations.map((c) => {
              const partner = c.otherUser;
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSearchParams({ id: c.id })}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                    isSelected ? 'bg-brand-50/70 border-r-4 border-brand-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={
                      partner?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'Student')}&background=7c3aed&color=fff`
                    }
                    alt={partner?.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {partner?.name || 'Fellow Student'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {c.lastMessage?.createdAt
                          ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.lastMessage?.content || 'Started conversation'}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-bold">
                        {c.unreadCount} new
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Main Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={
                    otherUser?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'Student')}&background=7c3aed&color=fff`
                  }
                  alt={otherUser?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{otherUser?.name}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    {otherUser?.college || 'University Peer'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/sessions"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  Schedule Live Session
                </Link>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 lg:block hidden"
                  title="Toggle student info"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-48 rounded-2xl" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Say hello! Introduce what you would like to learn and plan your session.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        {m.content}

                        {/* If this message contains a live session invite */}
                        {m.session && (
                          <div className="mt-3 p-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Video className="w-4 h-4" />
                              Live Session Invitation
                            </div>
                            <p className="text-[11px] opacity-90">{m.session.title}</p>
                            <Link
                              to={`/sessions/${m.session.meetingRoomId}`}
                              className="inline-block mt-1 px-3 py-1 bg-white text-brand-800 font-bold rounded-lg text-xs"
                            >
                              Join Meeting Room →
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-brand-600" />}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {partnerTyping && (
                <div className="text-xs text-brand-600 italic font-medium flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-brand-600 rounded-full" />
                  {partnerTyping}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message to partner..."
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>

      {/* 3. Right Panel: Student Profile Preview */}
      {showRightPanel && otherUser && (
        <div className="w-72 border-l border-slate-200 bg-white p-5 hidden lg:flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={
                  otherUser.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=7c3aed&color=fff`
                }
                alt={otherUser.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 mx-auto mb-2 shadow-xs"
              />
              <h4 className="text-sm font-bold text-slate-900">{otherUser.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{otherUser.college}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Skills They Teach:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(otherUser.skills || [])
                  .filter((s: any) => s.type === 'TEACH')
                  .map((s: any) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                    >
                      {s.skill?.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Skills They Want:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(otherUser.skills || [])
                  .filter((s: any) => s.type === 'LEARN')
                  .map((s: any) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      {s.skill?.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              to={`/profile/${otherUser.id}`}
              className="w-full text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 block"
            >
              Full Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
