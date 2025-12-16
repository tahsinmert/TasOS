'use client';

import { useState, useEffect } from 'react';

interface BatteryState {
  level: number; // 0-100
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
}

export function useBattery() {
  const [battery, setBattery] = useState<BatteryState>({
    level: 100,
    charging: false,
    chargingTime: null,
    dischargingTime: null,
  });

  useEffect(() => {
    // Try to use native Battery API
    if ('getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((batteryManager: any) => {
          const updateBattery = () => {
            setBattery({
              level: Math.round(batteryManager.level * 100),
              charging: batteryManager.charging,
              chargingTime: batteryManager.chargingTime,
              dischargingTime: batteryManager.dischargingTime,
            });
          };

          updateBattery();

          batteryManager.addEventListener('chargingchange', updateBattery);
          batteryManager.addEventListener('levelchange', updateBattery);
          batteryManager.addEventListener('chargingtimechange', updateBattery);
          batteryManager.addEventListener('dischargingtimechange', updateBattery);

          return () => {
            batteryManager.removeEventListener('chargingchange', updateBattery);
            batteryManager.removeEventListener('levelchange', updateBattery);
            batteryManager.removeEventListener('chargingtimechange', updateBattery);
            batteryManager.removeEventListener('dischargingtimechange', updateBattery);
          };
        })
        .catch(() => {
          // Fallback to simulation if API fails
          simulateBattery();
        });
    } else {
      // Fallback to simulation if API not supported
      simulateBattery();
    }
  }, []);

  const simulateBattery = () => {
    // Simulate battery drain
    let level = 85;
    let charging = false;

    const interval = setInterval(() => {
      if (!charging) {
        level = Math.max(0, level - 0.01); // Drain slowly
      } else {
        level = Math.min(100, level + 0.05); // Charge faster
      }

      setBattery({
        level: Math.round(level),
        charging,
        chargingTime: charging ? Math.round((100 - level) * 2) : null,
        dischargingTime: !charging ? Math.round(level * 3) : null,
      });
    }, 10000); // Update every 10 seconds

    // Simulate charging state changes
    const chargingInterval = setInterval(() => {
      charging = Math.random() > 0.7; // 30% chance to toggle charging
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      clearInterval(chargingInterval);
    };
  };

  return battery;
}

