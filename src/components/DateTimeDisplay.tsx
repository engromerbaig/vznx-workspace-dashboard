'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatTimeWithSeconds, formatWeekday, getCurrentDateTime , formatTime} from "@/utils/dateFormatter";


export default function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4 text-center min-w-[200px]">
      <div className="text-sm text-gray-700 font-medium mb-1">
        {formatWeekday(currentTime)} {/* Consistent! */}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">
        {formatTimeWithSeconds(currentTime)}
      </div>
      <div className="text-xs text-gray-600">
        {formatDate(currentTime)}
      </div>
    </div>
  );
}