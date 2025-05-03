export const RECREOS = [
    { start: "10:30", end: "10:45" },
    { start: "12:15", end: "12:35" }
  ];
  
  // Convierte "HH:MM" → minutos totales desde medianoche
  export function timeToMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }