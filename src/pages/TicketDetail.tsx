
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useParams, useNavigate } from 'react-router-dom';

const TicketDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSession();
        fetchTicket();

        // Subscribe to new messages (Realtime)
        const channel = supabase
            .channel(`ticket-${id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` },
                () => fetchMessages()
            )
            .subscribe((status) => {
                console.log('Realtime status:', status);
            });

        // Fallback: Polling every 4s to ensure messages appear even if Realtime fails
        const interval = setInterval(() => {
            fetchMessages();
        }, 4000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [id]);

    useEffect(() => {
        // Scroll to bottom of chat container only
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setUser(session.user);
            // Check admin
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile) setIsAdmin(profile.role === 'admin' || profile.role === 'moderator');
        }
    };

    const fetchTicket = async () => {
        if (!id) return;
        const { data } = await supabase.from('tickets').select('*, profiles(warrior_name)').eq('id', id).single();
        if (!data) {
            alert('Ticket no encontrado o eliminado.'); // Handle deleted tickets
            navigate('/tickets');
            return;
        }
        setTicket(data);
        fetchMessages();
    };

    const fetchMessages = async () => {
        if (!id) return;
        const { data } = await supabase
            .from('ticket_messages')
            .select(`
            *,
            sender:sender_id (warrior_name, role),
            attachments:ticket_attachments (*)
        `)
            .eq('ticket_id', id)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !uploading) return;
        if (!user || !ticket) return;

        await supabase.from('ticket_messages').insert({
            ticket_id: id,
            sender_id: user.id,
            content: newMessage,
            is_admin_reply: isAdmin
        });

        setNewMessage('');
        fetchMessages(); // Update UI immediately
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !id) return;

        // Validate size (e.g. 50MB) and type
        if (file.size > 50 * 1024 * 1024) {
            alert('El archivo es demasiado grande (Máx 50MB).');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('tickets-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert Message first
            const { data: msgData, error: msgError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: id,
                    sender_id: user.id,
                    content: `📎 Adjunto: ${file.name}`,
                    is_admin_reply: isAdmin
                })
                .select()
                .single();

            if (msgError) throw msgError;

            // 3. Insert Attachment Record
            await supabase.from('ticket_attachments').insert({
                ticket_id: id,
                message_id: msgData.id,
                file_path: filePath,
                file_type: file.type
            });

            fetchMessages(); // Update UI immediately after upload

        } catch (err: any) {
            alert('Error subiendo archivo: ' + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // CLEANUP FUNCTION
    const closeAndDeleteTicket = async () => {
        if (!confirm('¿Seguro? Se ELIMINARÁ TODO (chat y archivos) permanentemente.')) return;
        if (!ticket) return;

        try {
            // 1. List attachments to delete from Storage
            const { data: attachments } = await supabase
                .from('ticket_attachments')
                .select('file_path')
                .eq('ticket_id', ticket.id);

            if (attachments && attachments.length > 0) {
                const paths = attachments.map(a => a.file_path);
                await supabase.storage.from('tickets-media').remove(paths);
            }

            // 2. Delete Ticket from DB (Cascades messages and attachments rows)
            await supabase.from('tickets').delete().eq('id', ticket.id);

            alert('Ticket eliminado y limpiado.');
            navigate(isAdmin ? '/admin/tickets' : '/tickets');
        } catch (err: any) {
            alert('Error limpiando ticket: ' + err.message);
        }
    };

    // Helper to render media
    const renderAttachment = (attachment: any) => {
        const url = supabase.storage.from('tickets-media').getPublicUrl(attachment.file_path).data.publicUrl;
        if (attachment.file_type.startsWith('image/')) {
            return <img src={url} alt="Attachment" className="max-w-[200px] rounded-sm mt-2 border border-white/10" />;
        }
        if (attachment.file_type.startsWith('video/')) {
            return <video src={url} controls className="max-w-[300px] rounded-sm mt-2 border border-white/10" />;
        }
        return <a href={url} target="_blank" className="text-primary underline text-xs mt-2 block">{attachment.file_path}</a>;
    };

    if (!ticket) return <div className="p-20 text-center text-white">Cargando...</div>;

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-12 flex items-center justify-center">
            <div className="w-full max-w-3xl h-[80vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="flex-none border-b border-white/10 p-4 flex justify-between items-center bg-[#111] z-10">
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-wider text-sm md:text-base">{ticket.subject}</h2>
                        <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-1">
                            <span className="bg-primary/10 text-primary px-1 rounded">#{ticket.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{ticket.profiles?.warrior_name || 'Usuario'}</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={closeAndDeleteTicket}
                            className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-red-700 transition-colors rounded-sm"
                        >
                            Cerrar y Eliminar
                        </button>
                    )}
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        const isAdminMsg = msg.is_admin_reply;

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 ${isMe
                                    ? 'bg-primary text-black'
                                    : isAdminMsg
                                        ? 'bg-red-900/40 border border-red-500/30 text-white'
                                        : 'bg-[#1a1a1a] border border-white/5 text-gray-200'
                                    }`}>
                                    <div className="flex justify-between items-center mb-1 gap-4 opacity-50">
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${isMe ? 'text-black/70' : isAdminMsg ? 'text-red-300' : 'text-primary'}`}>
                                            {msg.sender?.warrior_name || 'Usuario'} {isAdminMsg && '(ADMIN)'}
                                        </span>
                                        <span className={`text-[9px] font-mono ${isMe ? 'text-black/60' : ''}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>

                                    {/* Attachments */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="mt-2 bg-black/10 p-1 rounded">
                                            {msg.attachments.map((att: any) => (
                                                <div key={att.id}>{renderAttachment(att)}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="flex-none p-4 bg-[#111] border-t border-white/10 z-10">
                    <form onSubmit={sendMessage} className="flex gap-2 items-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                            title="Enviar foto/video"
                        >
                            <span className="material-symbols-outlined text-xl">attach_file</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                        />

                        <div className="flex-1 relative">
                            <input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder={uploading ? "Subiendo archivo..." : "Escribe un mensaje..."}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-2.5 px-4 text-sm text-white focus:border-primary outline-none transition-colors placeholder:text-gray-600"
                                disabled={uploading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !newMessage.trim()}
                            className="bg-primary text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
