import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hridai-theme';

function readIsDark() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'dark';
}

export function useTheme() {
  const [isDark, setIsDark] = useState(readIsDark);

  // Cross-component sync. Multiple components may call useTheme (e.g. Profile
  // owns the toggle, VaultLayout reads isDark to pick the theme class). Each
  // instance keeps its own useState; without this listener, toggling in one
  // place wouldn't update the other. Storage event handles cross-tab too;
  // toggle() dispatches a synthetic event for the same-tab case.
  //
  // Use e.newValue directly, NOT readIsDark(). Our same-tab synthetic event
  // fires inside the setIsDark updater below, BEFORE the localStorage.setItem
  // in the [isDark] useEffect has run — so re-reading localStorage here would
  // return the stale previous value. e.newValue always reflects the intended
  // new state (we pass it explicitly on dispatch; real cross-tab storage
  // events populate it from the write that just landed). Fixes a state-sync
  // race that left VaultLayout's isDark one step behind Profile's after each
  // toggle click.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setIsDark(e.newValue === 'dark');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      // Same-tab sync for other useTheme instances.
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: next ? 'dark' : 'light' }));
      return next;
    });
  }, []);

  return { isDark, toggle };
}
