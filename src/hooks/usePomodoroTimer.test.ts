import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePomodoroTimer } from './usePomodoroTimer';

describe('usePomodoroTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with a 25-minute work session', () => {
    // Verifica la configuración inicial visible para el usuario.
    const { result } = renderHook(() => usePomodoroTimer({ onTimeTracked: vi.fn() }));

    expect(result.current.remainingTime).toBe(25 * 60);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isBreak).toBe(false);
  });

  it('saves the real elapsed minutes when the session is paused', () => {
    // Verifica que el tiempo guardado se basa en el reloj real, no en la cantidad de ticks.
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onTimeTracked = vi.fn();
    const { result } = renderHook(() => usePomodoroTimer({ onTimeTracked }));

    act(() => {
      result.current.setSelectedTaskId(7);
    });

    act(() => {
      result.current.toggleTimer();
    });
    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    act(() => {
      result.current.toggleTimer();
    });

    expect(onTimeTracked).toHaveBeenCalledWith(7, 1);
    expect(result.current.isActive).toBe(false);
  });

  it('moves to a short break after completing a work session', () => {
    // Verifica que finalizar una sesión activa el descanso y registra el tiempo trabajado.
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onTimeTracked = vi.fn();
    const send = vi.fn();
    Object.assign(window, { ipcRenderer: { send } });
    const { result } = renderHook(() => usePomodoroTimer({ onTimeTracked }));
    send.mockClear();

    act(() => {
      result.current.setSelectedTaskId(3);
      result.current.setWorkDuration(1 * 60);
    });

    act(() => {
      result.current.setWorkDuration(1 * 60);
    });

    act(() => {
      result.current.toggleTimer();
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.isBreak).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(result.current.remainingTime).toBe(5 * 60);
    expect(onTimeTracked).toHaveBeenCalledWith(3, 1);
    expect(send).toHaveBeenCalledWith('pomodoro-state-changed', { isBreak: true });
    expect(send).toHaveBeenCalledWith('pomodoro-notification', {
      title: 'Descanso iniciado',
      body: 'La sesión de trabajo terminó. Es hora de descansar.',
    });
  });

  it('resets the timer and clears the current session state', () => {
    // Verifica que reiniciar cancela la sesión y recupera la duración configurada.
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { result } = renderHook(() => usePomodoroTimer({ onTimeTracked: vi.fn() }));

    act(() => {
      result.current.toggleTimer();
    });
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.isBreak).toBe(false);
    expect(result.current.remainingTime).toBe(25 * 60);
    expect(result.current.elapsedTime).toBe(0);
  });
});
