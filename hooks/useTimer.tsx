import { useEffect, useState } from "react";

export default function useTimer(): [
  number,
  () => void,
  () => void,
] {
  const [time, setTime] = useState(0)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    let interval: number | undefined = undefined;

    if (active && !paused) {
      interval = window.setInterval(() => {
        setTime((time) => time + 1000)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => {
      clearInterval(interval)
    }
  }, [active, paused])

  const onFocus = () => {
    setPaused(false)
  }

  const onBlur = () => {
    setPaused(true)
  }

  const stop = () => {
    setActive(false)
  }

  const start = () => {
    setTime(0)
    setActive(true)
  }
  return [time, start, stop]
}
