import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, UserPlus, Banknote, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useNotificationStore, type NotificationType } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  inscription: { icon: UserPlus, color: 'text-primary' },
  paiement: { icon: Banknote, color: 'text-emerald-600' },
  rappel: { icon: AlertTriangle, color: 'text-amber-600' },
  evenement: { icon: Calendar, color: 'text-violet-600' },
  info: { icon: Info, color: 'text-sky-600' },
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotificationStore();
  const count = unreadCount();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell size={20} strokeWidth={1.5} className="text-muted-foreground" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-96 max-h-[70vh] bg-card border rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex gap-2">
                {count > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <CheckCheck size={14} /> Tout lire
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {!notifications.length ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Bell size={32} strokeWidth={1} className="mx-auto mb-2 opacity-50" />
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => {
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                  const Icon = config.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 ${config.color}`}>
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                            {!n.read && <span className="h-2 w-2 bg-primary rounded-full shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
