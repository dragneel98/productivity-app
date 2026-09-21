import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePomodoroTimerOptions {
  onTimeTracked: (taskId: number, minutesWorked: number) => void;
}

export const usePomodoroTimer = ({ onTimeTracked }: UsePomodoroTimerOptions) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number>();
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [remainingTime, setRemainingTime] = useState(workDuration);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickAtRef = useRef<number | null>(null);
  const sessionElapsedMsRef = useRef(0);
  const unsavedWorkedMsRef = useRef(0);

  const saveWorkedTime = useCallback(() => {
    if (selectedTaskId && unsavedWorkedMsRef.current > 0) {
      const minutesWorked = Math.floor(unsavedWorkedMsRef.current / 60_000);
      if (minutesWorked > 0) {
        onTimeTracked(selectedTaskId, minutesWorked);
      }
      unsavedWorkedMsRef.current = 0;
    }
  }, [selectedTaskId, onTimeTracked]);

  useEffect(() => {
    document.body.classList.toggle('break-mode', isBreak);
    window.ipcRenderer?.send('pomodoro-state-changed', { isBreak });

    return () => {
      document.body.classList.remove('break-mode');
    };
  }, [isBreak]);

  const syncClock = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    const lastTickAt = lastTickAtRef.current ?? now;
    const elapsedMs = Math.max(0, now - lastTickAt);
    lastTickAtRef.current = now;
    sessionElapsedMsRef.current += elapsedMs;

    if (!isBreak) {
      unsavedWorkedMsRef.current += elapsedMs;
      setElapsedTime(Math.floor(unsavedWorkedMsRef.current / 1000));
    }

    const durationMs = (isBreak
      ? (completedSessions % sessionsBeforeLongBreak === 0 ? longBreakDuration : breakDuration)
      : workDuration) * 1000;
    const remainingMs = Math.max(0, durationMs - sessionElapsedMsRef.current);
    setRemainingTime(Math.ceil(remainingMs / 1000));
  }, [isActive, isBreak, completedSessions, sessionsBeforeLongBreak, longBreakDuration, breakDuration, workDuration]);

  const handleSessionEnd = useCallback(() => {
    audioRef.current?.play().catch(() => {});

    if (!isBreak) {
      saveWorkedTime();
      window.ipcRenderer?.send('pomodoro-notification', {
        title: 'Descanso iniciado',
        body: 'La sesión de trabajo terminó. Es hora de descansar.',
      });
      setCompletedSessions((previousSessions) => {
        const newCount = previousSessions + 1;
        const isLongBreak = newCount % sessionsBeforeLongBreak === 0;
        const nextBreakDuration = isLongBreak ? longBreakDuration : breakDuration;

        setIsBreak(true);
        setRemainingTime(nextBreakDuration);
        setElapsedTime(0);
        sessionElapsedMsRef.current = 0;
        return newCount;
      });
    } else {
      window.ipcRenderer?.send('pomodoro-notification', {
        title: 'Trabajo reanudado',
        body: 'El descanso terminó. Puedes volver a trabajar.',
      });
      setIsBreak(false);
      setRemainingTime(workDuration);
      setElapsedTime(0);
      sessionElapsedMsRef.current = 0;
    }

    lastTickAtRef.current = null;
    setIsActive(false);
  }, [isBreak, saveWorkedTime, sessionsBeforeLongBreak, longBreakDuration, breakDuration, workDuration]);

  useEffect(() => {
    if (!isActive) return;

    if (lastTickAtRef.current === null) {
      lastTickAtRef.current = Date.now();
    }

    const interval = setInterval(syncClock, 250);
    return () => clearInterval(interval);
  }, [isActive, syncClock]);

  useEffect(() => {
    if (remainingTime === 0 && isActive) {
      handleSessionEnd();
    }
  }, [remainingTime, isActive, handleSessionEnd]);

  const toggleTimer = () => {
    if (isActive) {
      syncClock();
      if (!isBreak) {
        saveWorkedTime();
        setElapsedTime(0);
      }
      lastTickAtRef.current = null;
    } else {
      lastTickAtRef.current = Date.now();
    }
    setIsActive((active) => !active);
  };

  const resetTimer = () => {
    if (isActive) {
      syncClock();
    }
    if (!isBreak && unsavedWorkedMsRef.current > 0) {
      saveWorkedTime();
    }

    setIsActive(false);
    setIsBreak(false);
    setRemainingTime(workDuration);
    setElapsedTime(0);
    lastTickAtRef.current = null;
    sessionElapsedMsRef.current = 0;
    unsavedWorkedMsRef.current = 0;
  };

  const skipBreak = () => {
    if (isBreak) {
      setIsBreak(false);
      setRemainingTime(workDuration);
      setElapsedTime(0);
      setIsActive(false);
      lastTickAtRef.current = null;
      sessionElapsedMsRef.current = 0;
    }
  };

  useEffect(() => {
    if (!isActive) {
      if (isBreak) {
        const isLongBreak = completedSessions % sessionsBeforeLongBreak === 0;
        setRemainingTime(isLongBreak ? longBreakDuration : breakDuration);
      } else {
        setRemainingTime(workDuration);
      }
      sessionElapsedMsRef.current = 0;
      unsavedWorkedMsRef.current = 0;
      lastTickAtRef.current = null;
    }
  }, [workDuration, breakDuration, longBreakDuration, isActive, isBreak, completedSessions, sessionsBeforeLongBreak]);

  return {
    audioRef,
    selectedTaskId,
    setSelectedTaskId,
    isActive,
    isBreak,
    elapsedTime,
    workDuration,
    setWorkDuration,
    breakDuration,
    setBreakDuration,
    longBreakDuration,
    setLongBreakDuration,
    sessionsBeforeLongBreak,
    setSessionsBeforeLongBreak,
    remainingTime,
    showSettings,
    setShowSettings,
    toggleTimer,
    resetTimer,
    skipBreak,
  };
};
