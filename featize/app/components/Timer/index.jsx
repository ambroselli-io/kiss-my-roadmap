import { useEffect, useRef, useState } from "react";
import styles from "./styles.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

const Timer = (props) => {
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    setResetKey((k) => k + 1); // hack to make it work properly on ios
  }, []);
  return (
    <TimerCountdown key={resetKey} {...props} onReset={() => setResetKey((k) => k + 1)} />
  );
};

const TimerCountdown = ({
  size = 250,
  stroke = 5,
  countdown = 60,
  onReset,
  className = "",
  onStart = null,
  onDebateFinished = null,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(countdown);
  const [playState, setPlayState] = useState("paused"); // 'running'
  const firstStart = useRef();

  const togglePlayStateButton =
    playState === "running"
      ? "Pause"
      : timeRemaining === countdown
      ? "Démarrer"
      : timeRemaining === 0
      ? "Encore !"
      : "Reprendre";

  const toggleMainButton =
    playState === "running"
      ? "✋ Le débat est clos"
      : timeRemaining === countdown
      ? "🎬 Démarrer"
      : timeRemaining === 0
      ? "⏱ Fini"
      : "🍿 Reprendre";

  const timerDOMRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--timerDiameter", `${size}px`);
    document.documentElement.style.setProperty("--timerStroke", `${stroke}px`);
    document.documentElement.style.setProperty("--timerSize", `${size + stroke * 2}px`);
    document.documentElement.style.setProperty(
      "--timerInternalPerimeter",
      `${Math.round((size - stroke) * Math.PI * 10000) / 10000}px`
    );
    timerDOMRef.current.style.animationDuration = `${countdown}s`;
  }, [size, stroke, countdown]);

  useEffect(() => {
    timerDOMRef.current.style.animationPlayState = playState;
  }, [playState]);

  // Set up the interval.
  const timeout = useRef(null);
  const secondStartedAt = useRef(Date.now());
  const nextTick = useRef(null);

  useEffect(() => {
    if (playState === "running" && timeRemaining > 0) {
      secondStartedAt.current = Date.now();
      timeout.current = setTimeout(() => {
        if (playState === "running") {
          nextTick.current = 1000;
          setTimeRemaining((t) => t - 1);
        } else {
          clearTimeout(timeout.current);
        }
      }, nextTick.current);
      return () => clearTimeout(timeout.current);
    } else {
      setPlayState("paused");
      clearTimeout(timeout.current);
      const init = nextTick.current === null;
      nextTick.current = init ? 1000 : 1000 - (Date.now() - secondStartedAt.current);
    }
  }, [playState, timeRemaining]);
  useEffect(() => {
    if (toggleMainButton === "⏱ Fini") {
      onDebateFinished?.();
    }
  }, [toggleMainButton, onDebateFinished]);

  const togglePlayState = (e) => {
    if (togglePlayStateButton === "Encore !") {
      return onReset();
    }
    if (e.currentTarget?.innerText?.includes("✋ Le débat est clos")) {
      onDebateFinished?.();
    }
    if (playState === "paused") {
      setPlayState("running");
      if (!firstStart.current) {
        firstStart.current = true;
        onStart?.();
      }
    } else {
      setPlayState("paused");
    }
  };

  return (
    <div className={className}>
      <div
        className="timer-container relative flex items-center justify-center"
        onClick={togglePlayState}
      >
        <svg className="timer text-love" viewBox={`0 0 ${size} ${size}`}>
          <circle
            stroke="currentColor"
            strokeOpacity="0.2"
            fill="none"
            className="timer-circle-bg"
            strokeWidth={stroke}
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - stroke / 2}
            ref={timerDOMRef}
            onAnimationEnd={() => {
              setTimeRemaining(0);
              setPlayState("paused");
            }} // needed to be able to restart the animation
          />
          <circle
            stroke="currentColor"
            fill="none"
            className="timer-circle"
            strokeWidth={stroke}
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - stroke / 2}
            ref={timerDOMRef}
            onAnimationEnd={() => {
              // needed to be able to restart the animation
              if (playState !== "paused") {
                setTimeRemaining(0);
                setPlayState("paused");
              }
            }}
          />
        </svg>
        <span className="absolute">{display(timeRemaining, countdown)}</span>
        <button
          className="absolute bottom-12 z-10 rounded-full border-2 border-love bg-love px-4 text-lg font-bold text-white"
          onClick={togglePlayState}
        >
          {toggleMainButton}
        </button>
      </div>
      <div className="-mt-6 flex w-full justify-between">
        <button
          className="z-10 h-16 w-16 rounded-full border border-love bg-white text-xs text-love"
          onClick={onReset}
        >
          Annuler
        </button>
        <button
          className="z-10 h-16 w-16 rounded-full border border-love bg-love text-xs text-white"
          onClick={togglePlayState}
        >
          {togglePlayStateButton}
        </button>
      </div>
    </div>
  );
};
// https://stackoverflow.com/a/52560608/5225096
const display = (seconds, initialSeconds) => {
  const format = (val) => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;

  const initialHours = initialSeconds / 3600;
  if (initialHours > 1) return [hours, minutes, seconds % 60].map(format).join(":");
  return [minutes, seconds % 60].map(format).join(":");
};

export default Timer;
