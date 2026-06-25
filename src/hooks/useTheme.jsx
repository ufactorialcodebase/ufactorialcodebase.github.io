import { useState, useEffect, useCallback } from 'react';
import { useFeatureFlag } from './useFeatureFlag';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hridai-theme') === 'dark';
  });
  // The vault_redesign warm palette is light-only by design. When the flag is
  // on we suppress the .dark class so Tailwind dark: variants don't render
  // dark surfaces inside a warm-chrome shell (e.g. dark-navy MessageInput
  // against a cream rail). The user's stored preference is preserved —
  // flipping the flag off restores their dark choice.
  const flagOn = useFeatureFlag('vault_redesign');

  useEffect(() => {
    const root = document.documentElement;
    const shouldApplyDark = isDark && !flagOn;
    if (shouldApplyDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hridai-theme', isDark ? 'dark' : 'light');
  }, [isDark, flagOn]);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return { isDark, toggle };
}
