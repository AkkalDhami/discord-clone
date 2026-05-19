"use client";

import { useRef } from "react";

// import { useEffect, useState } from "react";

// export function useDebounce<T>(value: T, delay = 400): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return debouncedValue;
// }

export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounced = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return debounced;
}
