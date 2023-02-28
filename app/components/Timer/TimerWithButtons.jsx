import { useLocalStorage } from "app/services/useLocalStorage";
import Timer from ".";

const TimerWithButtons = ({
  countdowns = [
    { display: "30s", seconds: 30, ariaLabel: "30 seconds" },
    { display: "1m", seconds: 60, ariaLabel: "1 minutes" },
    { display: "2m", seconds: 120, ariaLabel: "2 minutes" },
    { display: "3m", seconds: 180, ariaLabel: "3 minutes" },
    { display: "5m", seconds: 300, ariaLabel: "5 minutes" },
    { display: "10m", seconds: 600, ariaLabel: "10 minutes" },
    { display: "30m", seconds: 1800, ariaLabel: "30 minutes" },
  ],
  className = "",
  onDebateFinished,
  onStart,
}) => {
  const [countdown, setCountdown] = useLocalStorage("countdown", 60);
  const [showChangeTime, setShowChangeTime] = useLocalStorage("showChangeTime", false);

  return (
    <div className="relative mt-8 flex shrink-0 flex-col items-center">
      <Timer
        key={countdown}
        countdown={countdown}
        className={className}
        onDebateFinished={onDebateFinished}
        onStart={onStart}
      />
      {showChangeTime && (
        <div className="flex items-center gap-2">
          {[...countdowns].reverse().map((c, i) => (
            <button
              key={i}
              type="button"
              aria-label={`retirer ${c.ariaLabel} au minuteur`}
              title={`retirer ${c.ariaLabel} au minuteur`}
              onClick={() => setCountdown(Math.max(10, Number(countdown) - c.seconds))}
              className="h-10 w-10 rounded-full border border-app border-opacity-50 bg-white bg-opacity-50 text-xs text-app"
            >
              -{c.display}
            </button>
          ))}
          {countdowns.map((c, i) => (
            <button
              key={i}
              type="button"
              aria-label={`ajouter ${c.ariaLabel} au minuteur`}
              title={`ajouter ${c.ariaLabel} au minuteur`}
              onClick={() => setCountdown(Number(countdown) + c.seconds)}
              className="h-10 w-10 rounded-full border-app border-opacity-50 bg-app bg-opacity-50 text-xs text-white"
            >
              +{c.display}
            </button>
          ))}
        </div>
      )}
      <button
        typwe="button"
        onClick={() => setShowChangeTime((s) => !s)}
        className="text-xs italic text-app opacity-50"
      >
        {!showChangeTime ? "Changer le temps" : "Cacher les boutons"}
      </button>
    </div>
  );
};

export default TimerWithButtons;
