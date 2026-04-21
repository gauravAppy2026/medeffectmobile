import { useEffect, useRef, useCallback } from 'react';
import { AppState, PanResponder } from 'react-native';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useInactivityTimeout(onTimeout) {
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onTimeout?.();
    }, INACTIVITY_TIMEOUT);
  }, [onTimeout]);

  // Track app state (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        // Going to background — record time
        backgroundTimeRef.current = Date.now();
      }

      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        // Coming back to foreground — check how long we were away
        if (backgroundTimeRef.current) {
          const elapsed = Date.now() - backgroundTimeRef.current;
          if (elapsed > INACTIVITY_TIMEOUT) {
            onTimeout?.();
            return;
          }
        }
        resetTimer();
      }

      appStateRef.current = nextState;
    });

    resetTimer();

    return () => {
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, onTimeout]);

  // PanResponder to detect user touches globally
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false; // Don't capture — just listen
      },
    }),
  ).current;

  return panResponder.panHandlers;
}
