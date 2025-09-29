import React, { useState, useEffect } from 'react';

const PomodoroTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          new Notification(isBreak ? 'Break finished!' : 'Work session finished!');
          setIsBreak(!isBreak);
          setMinutes(isBreak ? workMinutes : breakMinutes);
          setSeconds(0);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workMinutes);
    setSeconds(0);
  };

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  return (
    <div className="pomodoro-timer">
      <h2>{isBreak ? 'Break' : 'Work'}</h2>
      <div className="time-display">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
            <div className="timer-controls">
        <button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
        <button onClick={resetTimer}>Reset</button>
        <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
      </div>
      {showSettings && (
        <div className="pomodoro-settings">
          <div>
            <label>Work Minutes</label>
            <input
              type="number"
              value={workMinutes}
              onChange={e => setWorkMinutes(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Break Minutes</label>
            <input
              type="number"
              value={breakMinutes}
              onChange={e => setBreakMinutes(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
