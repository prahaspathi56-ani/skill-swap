import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Hand,
  PhoneOff,
  MessageSquare,
  FileText,
  Users,
  Star,
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const LiveSessionRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('notes');
  const [sessionNotes, setSessionNotes] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [peers, setPeers] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Review & Rating Modal on completion
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [teachingClarity, setTeachingClarity] = useState(5);
  const [sessionQuality, setSessionQuality] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socket = getSocket();

  // 1. Fetch session details & room access
  useEffect(() => {
    if (!roomId) return;
    api
      .get<any>(`/sessions/${roomId}`)
      .then((data) => {
        setSession(data);
        if (data.sessionNotes) setSessionNotes(data.sessionNotes);
      })
      .catch((err) => {
        console.error('Failed to load session:', err);
      });
  }, [roomId]);

  // 2. Initialize media and WebRTC
  useEffect(() => {
    if (!roomId || !user) return;

    const initMediaAndWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Camera/mic access denied, switching to audio/chat fallback mode:', err);
        setMediaError('Camera permission not available. Switched to Audio/Chat Mode.');
      }

      // Join room via socket
      socket.emit('join_session_room', {
        roomId,
        userId: user.id,
        userName: user.name,
      });

      // Socket listeners
      socket.on('session_participants', ({ participants }) => {
        setPeers(participants);
      });

      socket.on('peer_joined', ({ peerId, userName }) => {
        setPeers((prev) => Array.from(new Set([...prev, peerId])));
      });

      socket.on('peer_left', ({ peerId }) => {
        setPeers((prev) => prev.filter((id) => id !== peerId));
      });

      socket.on('session_notes_updated', ({ notes }) => {
        setSessionNotes(notes);
      });

      socket.on('new_session_chat', (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      });

      socket.on('peer_hand_raised', ({ userId: actorId, userName, isRaised }) => {
        setRaisedHands((prev) => {
          const updated = { ...prev };
          if (isRaised) {
            updated[actorId] = userName;
          } else {
            delete updated[actorId];
          }
          return updated;
        });
      });
    };

    initMediaAndWebRTC();

    return () => {
      // Clean up media tracks & socket
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socket.emit('leave_session_room', { roomId, userId: user.id });
      socket.off('session_participants');
      socket.off('peer_joined');
      socket.off('peer_left');
      socket.off('session_notes_updated');
      socket.off('new_session_chat');
      socket.off('peer_hand_raised');
    };
  }, [roomId, user]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.warn('Screen share cancelled', err);
      }
    } else {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    }
  };

  const toggleRaiseHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    socket.emit('raise_hand', {
      roomId,
      userId: user?.id,
      userName: user?.name,
      isRaised: nextState,
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSessionNotes(text);
    socket.emit('update_session_notes', {
      roomId,
      notes: text,
      senderName: user?.name,
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = {
      senderId: user?.id,
      senderName: user?.name,
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit('session_chat_message', { roomId, message: msg });
    setChatInput('');
  };

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this live session and submit feedback?')) {
      if (session?.id) {
        await api.patch(`/sessions/${session.id}/status`, { status: 'COMPLETED' });
        // Save final notes
        await api.patch(`/sessions/${session.id}/notes`, { notes: sessionNotes });
      }
      setShowReviewModal(true);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.id) return;
    setIsReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        sessionId: session.id,
        rating,
        teachingClarity,
        sessionQuality,
        comment: reviewComment || 'Great collaborative learning exchange!',
      });
      setShowReviewModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Review failed');
      navigate('/dashboard');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const partner = session?.hostId === user?.id ? session?.participant : session?.host;

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top Session Bar */}
      <div className="h-14 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h2 className="text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md">
              {session?.title || 'Live Learning Session'}
            </h2>
            <p className="text-[10px] text-slate-400">
              Topic: <span className="text-brand-400 font-semibold">{session?.skill?.name}</span>
            </p>
          </div>
        </div>

        {/* Hand Raised Alerts */}
        {Object.keys(raisedHands).length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold animate-bounce">
            <Hand className="w-3.5 h-3.5" />
            <span>{Object.values(raisedHands).join(', ')} raised hand!</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Partner: <span className="text-white font-bold">{partner?.name || 'Student'}</span>
          </span>
          <button
            onClick={handleEndSession}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            Leave / End
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="px-4 py-2 bg-amber-900/60 border-b border-amber-700 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {mediaError}
        </div>
      )}

      {/* Main Workspace: Video on left, Notes/Chat on right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Canvas Section */}
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Local Video Tile */}
            <div className="relative w-full h-full min-h-[220px] bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-xl flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/40 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <p className="text-xs text-slate-300 font-bold">{user?.name} (You)</p>
                  <span className="text-[10px] text-slate-500">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[11px] font-bold">
                You {isAudioMuted && '(Muted)'}
              </div>
            </div>

            {/* Remote Peer Video Tile */}
            <div className="relative w-full h-full min-h-[220px] bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-xl flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {partner?.name?.charAt(0) || 'P'}
                </div>
                <p className="text-xs text-slate-300 font-bold">{partner?.name || 'Partner'}</p>
                <span className="text-[10px] text-emerald-400">
                  {peers.length > 0 ? 'Connected in Live Room' : 'Waiting for student to join...'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[11px] font-bold">
                {partner?.name || 'Peer'}
              </div>
            </div>
          </div>

          {/* Bottom Live Controls Toolbar */}
          <div className="h-16 mt-4 flex items-center justify-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-2xl transition-all ${
                isAudioMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-2xl transition-all ${
                isVideoOff
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-2xl transition-all ${
                isScreenSharing
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Share Screen"
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRaiseHand}
              className={`p-3.5 rounded-2xl transition-all ${
                isHandRaised
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5" />
            </button>

            <button
              onClick={handleEndSession}
              className="p-3.5 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md shadow-rose-600/30"
              title="End Session"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Tabbed Drawer: Shared Notes & In-Room Chat */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 flex flex-col shrink-0">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-brand-500 text-brand-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Shared Notes
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-brand-500 text-brand-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              In-Room Chat
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'notes' ? (
              <div className="h-full flex flex-col">
                <span className="text-[10px] text-slate-400 mb-2 block">
                  Collaborative Live Notepad (Auto-synced with peer in real-time)
                </span>
                <textarea
                  value={sessionNotes}
                  onChange={handleNotesChange}
                  placeholder="Take notes together, copy code snippets, list follow-up action items..."
                  className="flex-1 w-full bg-slate-900 text-slate-100 rounded-2xl p-3.5 text-xs font-mono border border-slate-800 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-17rem)]">
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-8">
                      No messages yet. Send a link or chat with your peer!
                    </p>
                  ) : (
                    chatMessages.map((m, idx) => (
                      <div key={idx} className="text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-brand-400">{m.senderName}: </span>
                        <span className="text-slate-200">{m.content}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message peer..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-white"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-brand-600 rounded-xl hover:bg-brand-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Session Review & Rating Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          navigate('/dashboard');
        }}
        title="Session Completed! Leave Feedback"
      >
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-xs text-slate-500">
            Reviews help build genuine student trust without commercial course ratings.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Overall Session Rating:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold ${
                    rating >= s
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teaching Clarity (1-5):
            </label>
            <select
              value={teachingClarity}
              onChange={(e) => setTeachingClarity(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <option value={5}>5 - Crystal Clear & Pedagogical</option>
              <option value={4}>4 - Very Clear</option>
              <option value={3}>3 - Good Effort</option>
              <option value={2}>2 - Needs More Structure</option>
              <option value={1}>1 - Unprepared</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback / Review Comment:
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you learn? What did your partner do well?"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isReviewSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            >
              {isReviewSubmitting ? 'Submitting...' : 'Submit Review & Return to Dashboard'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
