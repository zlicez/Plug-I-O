import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useRackStore } from '../../features/rack/model/use-rack-store';
import { Button } from './Button';

export function ToastHost() {
  const notifications = useRackStore((state) => state.notifications);
  const dismiss = useRackStore((state) => state.dismissNotification);

  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.expiresAt)
      .map((notification) =>
        window.setTimeout(
          () => dismiss(notification.id),
          Math.max((notification.expiresAt ?? Date.now()) - Date.now(), 0),
        ),
      );
    return () => timers.forEach(window.clearTimeout);
  }, [dismiss, notifications]);

  return (
    <div aria-live="polite" className="toast-host">
      <AnimatePresence>
        {notifications.slice(-4).map((notification) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className={`toast toast--${notification.level}`}
            exit={{ opacity: 0, x: 28 }}
            initial={{ opacity: 0, x: 28 }}
            key={notification.id}
            role={notification.level === 'error' ? 'alert' : 'status'}
          >
            {notification.level === 'info' ? (
              <Info aria-hidden size={17} />
            ) : (
              <AlertTriangle aria-hidden size={17} />
            )}
            <div className="toast__copy">
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
            </div>
            {notification.level !== 'info' && (
              <Button
                aria-label="Dismiss notification"
                onClick={() => dismiss(notification.id)}
                size="icon"
                variant="ghost"
              >
                <X size={15} />
              </Button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
