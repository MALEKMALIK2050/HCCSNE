import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLocale } from '../_app';
import { ROLE_LABELS } from '@/lib/specialties';

const QUICK_EMOJIS = [
  { emoji: '🇩🇿', label: 'Algérie & Souveraineté', desc: 'Souveraineté nationale et projets d’intérêt stratégique pour l’État' },
  { emoji: '🏛️', label: 'Institution & Présidence', desc: 'Présidence de la République & Assemblée Plénière du Haut Conseil' },
  { emoji: '🔬', label: 'Recherche & Commissions', desc: 'Travaux scientifiques, recherche appliquée et réunions des commissions' },
  { emoji: '💡', label: 'Avis & Recommandation', desc: 'Proposition stratégique, note consultative ou idée d’innovation' },
  { emoji: '📄', label: 'Document & Rapport', desc: 'Rapport officiel, note de cadrage, texte légal ou décret' },
  { emoji: '✅', label: 'Validation Officielle', desc: 'Approbation formelle, accord de commission ou tâche finalisée' },
  { emoji: '👍', label: 'Acquiescement', desc: 'Prise en compte favorable, accord entre pairs et confirmation' },
  { emoji: '📌', label: 'Priorité & Rappel', desc: 'Point d’attention majeur, échéance ou élément prioritaire à retenir' },
];

export default function ChatPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Channels & Contacts data
  const [channels, setChannels] = useState({ general: null, commissions: [] });
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active selection: { type: 'room' | 'private', id: number | string, item: object }
  const [activeChat, setActiveChat] = useState(null);

  // Messages stream
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Status and feedback notices
  const [toast, setToast] = useState(null);

  // Mobile sidebar toggle
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  // Scroll references
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);
  activeChatRef.current = activeChat;

  // Show toast notification
  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Check user authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoadingUser(false));
  }, []);

  // 2. Load contacts and channels
  const loadContactsAndChannels = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/chat/contacts');
      const data = await res.json();
      if (data.success) {
        setChannels(data.channels || { general: null, commissions: [] });
        setContacts(data.contacts || []);

        // Initial selection: check query params or default to General Assembly
        if (isInitial && !activeChatRef.current) {
          const { contactId, roomId } = router.query;
          if (contactId) {
            const foundContact = data.contacts?.find((c) => c.id === parseInt(contactId));
            if (foundContact) {
              selectChat({ type: 'private', id: foundContact.id, item: foundContact });
              return;
            }
          }
          if (roomId) {
            if (parseInt(roomId) === 1 && data.channels?.general) {
              selectChat({ type: 'room', id: 1, item: data.channels.general });
              return;
            }
            const foundComm = data.channels?.commissions?.find((c) => c.roomId === parseInt(roomId));
            if (foundComm) {
              selectChat({ type: 'room', id: foundComm.roomId, item: foundComm });
              return;
            }
          }
          // Default: General Assembly
          if (data.channels?.general) {
            selectChat({ type: 'room', id: 1, item: data.channels.general });
          } else if (data.contacts && data.contacts.length > 0) {
            selectChat({ type: 'private', id: data.contacts[0].id, item: data.contacts[0] });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [router.query]);

  // Initial load when user is verified
  useEffect(() => {
    if (currentUser) {
      loadContactsAndChannels(true);
    }
  }, [currentUser, loadContactsAndChannels]);

  // Periodic polling for contacts/badges every 6s
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadContactsAndChannels(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentUser, loadContactsAndChannels]);

  // 3. Load messages for active conversation
  const loadMessages = useCallback(async (chat, isBackground = false) => {
    if (!chat) return;
    if (!isBackground) setLoadingMessages(true);

    try {
      let url = '';
      if (chat.type === 'private') {
        url = `/api/chat/messages?type=private&contactId=${chat.id}`;
      } else {
        url = `/api/chat/messages?type=room&roomId=${chat.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        // Reset unread count locally for this contact if private
        if (chat.type === 'private') {
          setContacts((prev) =>
            prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
          );
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      if (!isBackground) setLoadingMessages(false);
    }
  }, []);

  // When activeChat changes, load messages immediately
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat, false);
      // Auto-set notify email default
      if (activeChat.type === 'room' && activeChat.id === 1) {
        // Admin or Coordinator broadcast default to true
        setNotifyEmail(['ADMIN', 'COORDINATOR'].includes(currentUser?.role));
      } else {
        setNotifyEmail(true);
      }
    }
  }, [activeChat, currentUser, loadMessages]);

  // Periodic polling for active conversation messages every 3.5s
  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(() => {
      loadMessages(activeChatRef.current, true);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChat, loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle switching active chat
  const selectChat = (chat) => {
    setActiveChat(chat);
    setShowMobileSidebar(false);
  };

  // 4. Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending || !activeChat) return;

    const content = newMessage.trim();
    setSending(true);

    try {
      const payload = {
        type: activeChat.type,
        content,
        notifyEmail,
        ...(activeChat.type === 'private'
          ? { recipientId: activeChat.id }
          : { roomId: activeChat.id }),
      };

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        setMessages((prev) => [...prev, data.message]);

        // Feedback toast for broadcast / email notification
        if (notifyEmail) {
          if (activeChat.type === 'room' && activeChat.id === 1) {
            showToast('Message diffusé et notifications email envoyées aux membres !', 'success');
          } else if (activeChat.type === 'room') {
            showToast('Message partagé avec la commission (alerte email transmise).', 'success');
          } else {
            showToast('Message envoyé avec notification par email.', 'success');
          }
        }
      } else {
        alert(data.error || 'Erreur lors de l’envoi');
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Erreur réseau lors de l’envoi');
    } finally {
      setSending(false);
    }
  };

  // Helper: insert emoji in message input
  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  if (loadingUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', color: '#64748b' }}>
        Chargement de la messagerie...
      </div>
    );
  }

  if (!currentUser) return null;

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      (c.specialite && c.specialite.toLowerCase().includes(q)) ||
      (c.institution && c.institution.toLowerCase().includes(q)) ||
      (c.pays && c.pays.toLowerCase().includes(q))
    );
  });

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const canBroadcastGeneral = ['ADMIN', 'COORDINATOR'].includes(currentUser.role);

  return (
    <>
      <Head>
        <title>Messagerie Sécurisée — HCCSNE</title>
      </Head>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>

        {/* ============================================================== */}
        {/* TOP NAVBAR                                                     */}
        {/* ============================================================== */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.65rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e2e8f0',
                transition: 'all 0.15s ease',
              }}
            >
              <span>&larr;</span> Espace Membre
            </Link>

            <div style={{ height: 20, width: 1, background: '#cbd5e1' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #006233, #007A40)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                💬
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Messagerie Institutionnelle
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '2px 8px',
                      borderRadius: 12,
                      letterSpacing: '0.3px',
                    }}
                  >
                    Sécurisée Décret 26-293
                  </span>
                </h1>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                  Échanges pléniers, commissions souveraines et messagerie privée directe
                </p>
              </div>
            </div>
          </div>

          {/* Current User Pill & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {totalUnread > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', animation: 'badgePulse 1.8s infinite' }} />
                {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 20,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: currentUser.photo ? `url('${currentUser.photo}') center/cover` : '#006233',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {!currentUser.photo && `${currentUser.prenom[0]}${currentUser.nom[0]}`}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                {currentUser.prenom} {currentUser.nom}
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: currentUser.role === 'ADMIN' ? '#dbeafe' : currentUser.role === 'COORDINATOR' ? '#fef3c7' : '#ecfdf5',
                  color: currentUser.role === 'ADMIN' ? '#1d4ed8' : currentUser.role === 'COORDINATOR' ? '#b45309' : '#047857',
                }}
              >
                {currentUser.role === 'COORDINATOR' ? 'Coordonnateur' : currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'LEADER' ? 'Chef' : 'Membre'}
              </span>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="md:hidden"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: '#006233',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {showMobileSidebar ? 'Afficher Chat' : '☰ Contacts'}
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: 70,
              right: 24,
              zIndex: 9999,
              background: toast.type === 'success' ? '#006233' : '#dc2626',
              color: 'white',
              padding: '10px 18px',
              borderRadius: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
            {toast.text}
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN 2-COLUMN CHAT CONTAINER                                  */}
        {/* ============================================================== */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ------------------------------------------------------------ */}
          {/* LEFT SIDEBAR: CANAUX & CONTACTS (Inspiré DZAcademy)           */}
          {/* ------------------------------------------------------------ */}
          <aside
            style={{
              width: 330,
              minWidth: 330,
              background: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              zIndex: 20,
            }}
            className={`${showMobileSidebar ? 'block' : 'hidden md:flex'}`}
          >
            {/* Search Input */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un membre, spécialité..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>

              {/* -------------------------------------------------------- */}
              {/* SECTION 1: CANAL GÉNÉRAL (MODE A)                        */}
              {/* -------------------------------------------------------- */}
              <div style={{ padding: '0.35rem 1rem 0.25rem 1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📢 Canaux Pléniers</span>
                  <span style={{ color: '#006233', fontSize: '0.65rem' }}>Décret 26-293</span>
                </div>
              </div>

              {channels.general && (
                <div
                  onClick={() => selectChat({ type: 'room', id: 1, item: channels.general })}
                  style={{
                    margin: '3px 8px',
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: activeChat?.type === 'room' && activeChat.id === 1 ? '#ecfdf5' : 'transparent',
                    border: activeChat?.type === 'room' && activeChat.id === 1 ? '1px solid #a7f3d0' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #006233 0%, #C8A951 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    🏛️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Assemblée Générale
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 6 }}>
                        30 Membres
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {canBroadcastGeneral ? 'Diffusion officielle à tous les membres' : 'Canal transversal du Haut Conseil'}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SECTION 2: COMMISSIONS DE SPÉCIALITÉ (MODE C)            */}
              {/* -------------------------------------------------------- */}
              {channels.commissions && channels.commissions.length > 0 && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ padding: '0.35rem 1rem 0.25rem 1rem', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    🏛️ {canBroadcastGeneral ? 'Les 10 Commissions Souveraines' : 'Ma Commission de Travail'}
                  </div>

                  {channels.commissions.map((comm) => {
                    const isSelected = activeChat?.type === 'room' && activeChat.id === comm.roomId;
                    return (
                      <div
                        key={comm.id}
                        onClick={() => selectChat({ type: 'room', id: comm.roomId, item: comm })}
                        style={{
                          margin: '3px 8px',
                          padding: '9px 12px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          background: isSelected ? '#ecfdf5' : 'transparent',
                          border: isSelected ? '1px solid #a7f3d0' : '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: isSelected ? '#006233' : '#f1f5f9',
                            color: isSelected ? 'white' : '#006233',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          🔬
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {comm.shortName}
                            </div>
                            {comm.memberCount > 0 && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                {comm.memberCount} p.
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {comm.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SECTION 3: MESSAGES PRIVÉS ENTRE MEMBRES (MODE B)        */}
              {/* -------------------------------------------------------- */}
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ padding: '0.35rem 1rem 0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    💬 Membres du Conseil ({filteredContacts.length})
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#006233', fontWeight: 700 }}>
                    Messages Privés
                  </span>
                </div>

                {loadingContacts ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Chargement des membres...
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Aucun membre trouvé
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = activeChat?.type === 'private' && activeChat.id === contact.id;
                    const hasUnread = contact.unreadCount > 0;

                    return (
                      <div
                        key={contact.id}
                        onClick={() => selectChat({ type: 'private', id: contact.id, item: contact })}
                        style={{
                          margin: '3px 8px',
                          padding: '9px 12px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          background: isSelected ? '#ecfdf5' : hasUnread ? '#fffbeb' : 'transparent',
                          border: isSelected ? '1px solid #a7f3d0' : hasUnread ? '1px solid #fde68a' : '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        {/* Member Photo / Initials */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: contact.photo ? `url('${contact.photo}') center/cover` : '#006233',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                          >
                            {!contact.photo && `${contact.prenom[0]}${contact.nom[0]}`}
                          </div>
                          {contact.role === 'COORDINATOR' && (
                            <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '0.7rem' }}>
                              ⭐
                            </span>
                          )}
                        </div>

                        {/* Member Information */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: hasUnread ? 800 : 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {contact.prenom} {contact.nom}
                            </div>
                            {/* Unread Badge (pulsing red pill as in DZAcademy) */}
                            {hasUnread && (
                              <span
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  borderRadius: 12,
                                  padding: '1px 6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  minWidth: 18,
                                  textAlign: 'center',
                                  animation: 'badgePulse 2s infinite',
                                }}
                              >
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                            {contact.specialite || contact.institution || 'Membre du Conseil'}
                          </div>

                          {contact.lastMessage && (
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                              {contact.lastMessage.isMe ? 'Vous: ' : ''}{contact.lastMessage.content}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </aside>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT MAIN AREA: CONVERSATION STREAM & COMPOSER              */}
          {/* ------------------------------------------------------------ */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', height: '100%', overflow: 'hidden' }}>

            {activeChat ? (
              <>
                {/* 1. Header of active chat */}
                <div
                  style={{
                    padding: '0.85rem 1.5rem',
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {activeChat.type === 'private' ? (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: activeChat.item?.photo ? `url('${activeChat.item?.photo}') center/cover` : '#006233',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {!activeChat.item?.photo && `${activeChat.item?.prenom[0]}${activeChat.item?.nom[0]}`}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: activeChat.id === 1 ? 'linear-gradient(135deg, #006233, #C8A951)' : '#006233',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                        }}
                      >
                        {activeChat.id === 1 ? '📢' : '🏛️'}
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {activeChat.type === 'private'
                            ? `${activeChat.item?.prenom} ${activeChat.item?.nom}`
                            : activeChat.item?.name}
                        </h2>
                        {activeChat.type === 'private' && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: activeChat.item?.role === 'COORDINATOR' ? '#fef3c7' : activeChat.item?.role === 'LEADER' ? '#ecfdf5' : '#f1f5f9',
                              color: activeChat.item?.role === 'COORDINATOR' ? '#92400e' : activeChat.item?.role === 'LEADER' ? '#065f46' : '#475569',
                            }}
                          >
                            {activeChat.item?.role === 'COORDINATOR' ? '⭐ Coordonnateur Général' : activeChat.item?.role === 'LEADER' ? '🔷 Chef de Commission' : '🔹 Membre'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                        {activeChat.type === 'private'
                          ? `${activeChat.item?.specialite || 'Expert Scientifique'} ${activeChat.item?.institution ? `• ${activeChat.item?.institution}` : ''} ${activeChat.item?.pays ? `(${activeChat.item?.pays})` : ''}`
                          : activeChat.id === 1
                          ? '📢 Canal plénier — Tous les 30 membres du Haut Conseil'
                          : activeChat.item?.description || 'Groupe de travail restreint'}
                      </div>
                    </div>
                  </div>

                  {/* Actions / Refresh */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => loadMessages(activeChat, false)}
                      title="Actualiser les messages"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>🔄</span>
                      <span className="hidden sm:inline">Actualiser</span>
                    </button>
                  </div>
                </div>

                {/* 2. Message Stream */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Official Notice for General Assembly */}
                  {activeChat.type === 'room' && activeChat.id === 1 && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)',
                        border: '1px solid #86efac',
                        borderLeft: '4px solid #006233',
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontSize: '0.82rem',
                        color: '#166534',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🇩🇿</span> Communication Plénière du Haut Conseil (Décret 26-293)
                      </div>
                      <div>
                        Les messages postés ici sont visibles par l'ensemble des 30 membres éminents du Conseil. Les coordinateurs et l'administration peuvent diffuser des avis officiels avec notification email instantanée.
                      </div>
                    </div>
                  )}

                  {/* Commission Notice */}
                  {activeChat.type === 'room' && activeChat.id > 1 && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderLeft: '4px solid #007A40',
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontSize: '0.82rem',
                        color: '#14532d',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 2 }}>
                        🏛️ Espace de travail de la {activeChat.item?.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                        Débats techniques, préparation des recommandations prioritaires et concertations confidentielles entre membres de la commission.
                      </div>
                    </div>
                  )}

                  {loadingMessages ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Chargement des messages sécurisés...
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#64748b',
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px dashed #cbd5e1',
                        margin: 'auto 0',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                        Aucun message échangé pour le moment
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 440, margin: '0 auto', lineHeight: 1.5 }}>
                        {activeChat.type === 'private'
                          ? `Initiez la discussion avec ${activeChat.item?.prenom} ${activeChat.item?.nom}. Une notification par email lui sera automatiquement transmise.`
                          : 'Soyez le premier à poster un message ou une proposition de travail dans cet espace.'}
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.userId === currentUser.id;
                      const sender = m.user || {};
                      const timeStr = new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const dateStr = new Date(m.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      });

                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          {/* Sender Info for non-me messages in rooms */}
                          {!isMe && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, marginLeft: 4 }}>
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  background: sender.photo ? `url('${sender.photo}') center/cover` : '#006233',
                                  color: 'white',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {!sender.photo && `${sender.prenom ? sender.prenom[0] : 'M'}${sender.nom ? sender.nom[0] : ''}`}
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                                {sender.prenom} {sender.nom}
                              </span>
                              {sender.role && sender.role !== 'MEMBER' && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: 8,
                                    background: sender.role === 'COORDINATOR' ? '#fef3c7' : '#ecfdf5',
                                    color: sender.role === 'COORDINATOR' ? '#92400e' : '#065f46',
                                  }}
                                >
                                  {sender.role === 'COORDINATOR' ? 'Coordonnateur' : sender.role === 'LEADER' ? 'Chef' : 'Admin'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            style={{
                              maxWidth: '75%',
                              background: isMe
                                ? 'linear-gradient(135deg, #006233 0%, #007A40 100%)'
                                : '#ffffff',
                              color: isMe ? '#ffffff' : '#1e293b',
                              borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              padding: '10px 16px',
                              boxShadow: isMe
                                ? '0 2px 8px rgba(0, 98, 51, 0.22)'
                                : '0 1px 4px rgba(0, 0, 0, 0.06)',
                              border: isMe ? 'none' : '1px solid #e2e8f0',
                              fontSize: '0.9rem',
                              lineHeight: 1.55,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {m.content}

                            {/* Bubble Footer with Timestamp & Status */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 4,
                                marginTop: 4,
                                fontSize: '0.68rem',
                                color: isMe ? 'rgba(255,255,255,0.75)' : '#94a3b8',
                              }}
                            >
                              <span>{timeStr}</span>
                              <span style={{ fontSize: '0.62rem' }}>&bull;</span>
                              <span>{dateStr}</span>
                              {isMe && activeChat.type === 'private' && (
                                <span style={{ marginLeft: 2, color: m.lu ? '#86efac' : 'rgba(255,255,255,0.85)', fontWeight: 800 }}>
                                  {m.lu ? '✓✓ Lu' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* 3. Composer / Input Area */}
                <div
                  style={{
                    background: '#ffffff',
                    borderTop: '1px solid #e2e8f0',
                    padding: '0.85rem 1.5rem',
                    flexShrink: 0,
                  }}
                >
                  {/* Emoji Bar & Notification Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    {/* Fast Emojis with Explanatory Floating Bubbles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginRight: 2 }} className="hidden sm:inline">
                        Symboles :
                      </span>
                      {QUICK_EMOJIS.map((item, idx) => (
                        <div key={item.emoji} className={`emoji-tooltip-container ${idx === 0 ? 'first-emoji' : idx >= QUICK_EMOJIS.length - 2 ? 'last-emoji' : ''}`}>
                          <button
                            type="button"
                            onClick={() => insertEmoji(item.emoji)}
                            title={`${item.emoji} ${item.label} : ${item.desc}`}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.95rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.emoji}
                          </button>

                          {/* Explanatory Floating Bubble */}
                          <div className="emoji-bubble">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#f8fafc', fontSize: '0.74rem' }}>
                              <span>{item.emoji}</span>
                              <span style={{ color: '#C8A951' }}>{item.label}</span>
                            </div>
                            <div style={{ fontSize: '0.67rem', color: '#cbd5e1', marginTop: 2, maxWidth: 220, whiteSpace: 'normal', lineHeight: 1.35 }}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Email Notification Switch */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: notifyEmail ? '#006233' : '#64748b',
                        background: notifyEmail ? '#ecfdf5' : '#f8fafc',
                        border: notifyEmail ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                        padding: '4px 10px',
                        borderRadius: 20,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                        style={{ accentColor: '#006233', cursor: 'pointer' }}
                      />
                      <span>
                        {activeChat.type === 'room' && activeChat.id === 1
                          ? 'Alerter les 30 membres par email ✉️'
                          : activeChat.type === 'room'
                          ? 'Alerter la commission par email ✉️'
                          : 'Alerter le destinataire par email ✉️'}
                      </span>
                    </label>
                  </div>

                  {/* Textarea & Send Button */}
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        activeChat.type === 'room' && activeChat.id === 1
                          ? canBroadcastGeneral
                            ? 'Rédiger une communication officielle pour l\'ensemble des membres (Entrée pour envoyer)...'
                            : 'Écrire un message plénier à tous les membres (Entrée pour envoyer)...'
                          : activeChat.type === 'room'
                          ? `Échanger avec les membres de la commission ${activeChat.item?.shortName}...`
                          : `Écrire un message privé sécurisé à ${activeChat.item?.prenom} ${activeChat.item?.nom}...`
                      }
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        lineHeight: 1.45,
                        boxSizing: 'border-box',
                      }}
                    />

                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      style={{
                        padding: '12px 22px',
                        background: !newMessage.trim() || sending
                          ? '#cbd5e1'
                          : 'linear-gradient(135deg, #006233 0%, #007A40 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: newMessage.trim() && !sending ? '0 2px 8px rgba(0, 98, 51, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sending ? (
                        <span>Envoi...</span>
                      ) : (
                        <>
                          <span>Envoyer</span>
                          <span>📤</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                Sélectionnez un canal ou un membre dans le menu de gauche pour commencer.
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Tooltips & Animation CSS */}
      <style jsx global>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Explanatory Emoji Tooltip Bubbles */
        .emoji-tooltip-container {
          position: relative;
          display: inline-flex;
        }

        .emoji-tooltip-container button {
          transition: all 0.15s ease;
        }

        .emoji-tooltip-container button:hover {
          transform: translateY(-2px) scale(1.08);
          background: #ecfdf5 !important;
          border-color: #006233 !important;
          box-shadow: 0 2px 6px rgba(0, 98, 51, 0.18);
        }

        .emoji-bubble {
          position: absolute;
          bottom: calc(100% + 9px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: #0f172a;
          border: 1px solid #334155;
          border-top: 2px solid #C8A951;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 999;
          min-width: 180px;
          text-align: left;
        }

        .emoji-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: #0f172a transparent transparent transparent;
        }

        /* First emoji tooltip aligned left so it stays within viewport */
        .emoji-tooltip-container.first-emoji .emoji-bubble {
          left: 0;
          transform: translateY(4px);
        }

        .emoji-tooltip-container.first-emoji:hover .emoji-bubble {
          transform: translateY(0);
        }

        .emoji-tooltip-container.first-emoji .emoji-bubble::after {
          left: 18px;
          transform: none;
        }

        /* Last emojis tooltip aligned right so they don't overflow right edge */
        .emoji-tooltip-container.last-emoji .emoji-bubble {
          left: auto;
          right: 0;
          transform: translateY(4px);
        }

        .emoji-tooltip-container.last-emoji:hover .emoji-bubble {
          transform: translateY(0);
        }

        .emoji-tooltip-container.last-emoji .emoji-bubble::after {
          left: auto;
          right: 14px;
          transform: none;
        }

        /* Hover trigger */
        .emoji-tooltip-container:hover .emoji-bubble {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .emoji-tooltip-container.first-emoji:hover .emoji-bubble {
          transform: translateY(0);
        }

        .emoji-tooltip-container.last-emoji:hover .emoji-bubble {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
