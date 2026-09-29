export const MIN_X = -15.0;
export const MAX_X = 15.0;
export const MIN_Y = -25.0;
export const MAX_Y = 25.0;

export const LOCATION_MAP = {
  'Pickup A': [-11.5, 13.0],
  'Pickup B': [1.5, 3.0],
  'Pickup C': [9.5, 21.0],
  'Pickup D': [10.5, 9.0],
  'Pickup E': [10.0, 5.5],
  'Drop A' : [11.0, -5.0],
  'Drop B' : [3.0, -13.0],
  'Drop C' : [-11.5, 9.0],
  'Drop D': [-9.0, -1.0],
  'Drop E': [-9.0, -6.0],
  'Drop F': [-9.0, -11.0],
  'Drop G': [-9.0, -16.0],
  'Drop H': [-2.0, -21.0],
  'Drop I': [6.0, -23.0],
};

export const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 55%)`;
};

export const getBatteryColor = (level) => {
  if (level > 50) return 'text-emerald-500';
  if (level > 20) return 'text-amber-500';
  return 'text-rose-500';
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Assigned': return 'bg-indigo-100 text-indigo-700';
    case 'Bidding': return 'bg-purple-100 text-purple-700 animate-pulse';
    default: return 'bg-amber-100 text-amber-700';
  }
};
