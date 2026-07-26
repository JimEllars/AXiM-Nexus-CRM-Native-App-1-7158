import { create } from 'zustand';

export const useCommodoreStore = create((set) => ({
  telemetryLogs: [],
  routeHistory: [],

  addTelemetryLog: (log) => set((state) => ({ telemetryLogs: [...state.telemetryLogs, log] })),
  addRouteHistory: (route) => set((state) => ({ routeHistory: [...state.routeHistory, route] })),

  updateTelemetryLogs: (logs) => set({ telemetryLogs: logs }),
  updateRouteHistory: (history) => set({ routeHistory: history }),
}));
