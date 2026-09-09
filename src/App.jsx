import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
  transports: ['websocket', 'polling']
});

const GRID_MAX_X = 10;
const GRID_MAX_Y = 10;

// Generates a random vibrant color using HSL
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  // 80% saturation and 55% lightness ensures the colors are bright and visible
  return `hsl(${hue}, 80%, 55%)`;
};

export default function FleetDashboard() {
  const [robots, setRobots] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to ROS 2 Backend!');
    });

    socket.on('fleet_update', (data) => {
      setRobots(prev => {
        // Check if we already have a color for this robot, otherwise generate one
        const existingRobot = prev[data.id];
        const robotColor = existingRobot ? existingRobot.color : generateRandomColor();
        
        return { 
          ...prev, 
          [data.id]: { ...data, color: robotColor } 
        };
      });
    });

    return () => {
      socket.off('connect');
      socket.off('fleet_update');
    };
  }, []);

  const getBatteryTextColor = (level) => {
    if (level > 50) return 'text-emerald-500';
    if (level > 20) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBatteryBgColor = (level) => {
    if (level > 50) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex h-screen bg-slate-100 p-6 gap-6 font-sans">
      
      {/* LEFT SECTION (2/3): CARTESIAN MAP */}
      <div className="w-2/3 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white p-4 font-semibold text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            Live Fleet Map
          </div>
          <span className="text-sm font-normal text-slate-300">
            Scale: {GRID_MAX_X}m x {GRID_MAX_Y}m Grid
          </span>
        </div>
        
        <div 
          className="relative flex-grow bg-slate-50 overflow-hidden m-6 border-2 border-slate-200 rounded-xl shadow-inner"
          style={{ 
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '10% 10%' 
          }}
        >
          <div className="absolute left-1 bottom-1 text-xs text-slate-400 font-mono bg-white/80 px-1 rounded">
            (0,0)
          </div>

          {Object.values(robots).map((robot) => {
            const leftPercent = Math.min(Math.max((robot.x / GRID_MAX_X) * 100, 0), 100);
            const bottomPercent = Math.min(Math.max((robot.y / GRID_MAX_Y) * 100, 0), 100);
            
            return (
              <div 
                key={`map-${robot.id}`}
                className="absolute transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
              >
                {/* The Big Dot (Now with dynamic color) */}
                <div 
                  className="w-6 h-6 border-4 border-white rounded-full shadow-md relative group z-10"
                  style={{ backgroundColor: robot.color }}
                >
                  <div 
                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: robot.color }}
                  ></div>
                </div>
                
                {/* Robot ID Label */}
                <div className="mt-2 bg-slate-800 text-white text-xs px-2 py-1 rounded-md shadow-lg font-mono z-20">
                  {robot.id}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT SECTION (1/3): FLEET LIST */}
      <div className="w-1/3 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200">
        <div className="bg-slate-800 text-white p-4 font-semibold text-lg flex justify-between items-center rounded-t-2xl">
          Fleet Status
          <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
            {Object.keys(robots).length} Online
          </span>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow space-y-4">
          {Object.values(robots).length === 0 ? (
            <div className="text-center text-slate-400 mt-10">Waiting for telemetry data...</div>
          ) : (
            Object.values(robots).map(robot => (
              <div 
                key={`list-${robot.id}`} 
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    {/* Unique Color Indicator */}
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm border-2 border-white ring-1 ring-slate-200" 
                      style={{ backgroundColor: robot.color }}
                    ></div>
                    <span className="font-bold text-slate-700 text-lg">{robot.id}</span>
                  </div>
                  <span className={`font-bold ${getBatteryTextColor(robot.battery)}`}>
                    {robot.battery}%
                  </span>
                </div>

                <div className="flex gap-4 text-sm text-slate-600 mb-4">
                  <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm flex-1 text-center">
                    <span className="text-slate-400 font-semibold mr-2">X:</span> 
                    <span className="font-mono">{robot.x.toFixed(2)}</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm flex-1 text-center">
                    <span className="text-slate-400 font-semibold mr-2">Y:</span> 
                    <span className="font-mono">{robot.y.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 shadow-inner overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${getBatteryBgColor(robot.battery)} transition-all duration-500`} 
                    style={{ width: `${robot.battery}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}