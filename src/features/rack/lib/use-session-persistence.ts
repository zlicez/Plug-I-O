import { useEffect, useRef } from 'react';
import { localSessionRepository } from '../../../shared/lib/session-repository';
import { useRackStore } from '../model/use-rack-store';

export function useSessionPersistence() {
  const initialised = useRef(false);
  const rackConfigured = useRackStore((state) => state.rackConfigured);
  const getSession = useRackStore((state) => state.getSession);
  const loadSession = useRackStore((state) => state.loadSession);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const stored = localSessionRepository.load();
    if (stored) loadSession(stored);
  }, [loadSession]);

  useEffect(() => {
    if (!rackConfigured) return undefined;
    const timer = window.setInterval(() => localSessionRepository.save(getSession()), 30000);
    return () => window.clearInterval(timer);
  }, [getSession, rackConfigured]);
}
