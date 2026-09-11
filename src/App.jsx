import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
  transports: ['websocket', 'polling']
});

// Canvas Coordinate System Bounds
const MIN_X = -10;
const MAX_X = 10;
const MIN_Y = 0;
const MAX_Y = 20;

// Hardcoded Hash-Map for Task Locations
const LOCATION_MAP = {
  'Pickup A': [-1.5, 5.0],
  'Pickup B': [1.0, 5.0],
  'Pickup C': [6.5, 5.0],
  'Drop A': [-9.0, 15.0],
  'Drop B': [1.0, 15.0],
  'Drop C': [6.5, 15.0]
};

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 55%)`;
};

export default function FleetDashboard() {
  const [robots, setRobots] = useState({});
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
  const [taskForm, setTaskForm] = useState({
    pickup: 'Pickup A',
    drop: 'Drop A',
    priority: false
  });

  const canvasRef = useRef(null);

  // --------------------------------------------------------
  // SOCKET CONNECTION
  // --------------------------------------------------------
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to ROS 2 Backend!'));

    socket.on('fleet_update', (data) => {
      setRobots(prev => {
        const existingRobot = prev[data.id];
        const robotColor = existingRobot ? existingRobot.color : generateRandomColor();
        return { ...prev, [data.id]: { ...data, color: robotColor } };
      });
    });

    return () => {
      socket.off('connect');
      socket.off('fleet_update');
    };
  }, []);

  // --------------------------------------------------------
  // CANVAS RENDERING ENGINE
  // --------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const mapX = (x) => ((x - MIN_X) / (MAX_X - MIN_X)) * width;
    const mapY = (y) => height - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = MIN_X; i <= MAX_X; i += 2) {
      const px = mapX(i);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
    }
    for (let i = MIN_Y; i <= MAX_Y; i += 2) {
      const py = mapY(i);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(width, py); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; 
    ctx.fillRect(mapX(-10), mapY(16), mapX(10) - mapX(-10), mapY(14) - mapY(16));
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; 
    ctx.fillRect(mapX(-2), mapY(6), mapX(7) - mapX(-2), mapY(4) - mapY(6));

    Object.values(robots).forEach(robot => {
      const px = mapX(robot.x);
      const py = mapY(robot.y);

      ctx.beginPath();
      ctx.arc(px, py, 10, 0, 2 * Math.PI);
      ctx.fillStyle = robot.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(robot.id, px + 14, py + 5);
    });
  }, [robots]);

  // --------------------------------------------------------
  // TASK HANDLING
  // --------------------------------------------------------
  const handleSubmitTask = (e) => {
    e.preventDefault();
    
    // Generate a unique task ID (e.g., TSK-4921)
    const newTaskId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

    const taskData = {
      task_id: newTaskId,
      pickup: LOCATION_MAP[taskForm.pickup],
      drop: LOCATION_MAP[taskForm.drop],
      priority: taskForm.priority
    };
    
    console.log(taskData)
    socket.emit('issue_task', taskData, (response) => {
      console.log('Backend acknowledged:', response?.status);
    });

    setTasks(prev => [...prev, { ...taskForm, id: newTaskId, status: 'Queued' }]);
    setIsModalOpen(false);
  };

  // --------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------
  const getBatteryColor = (level) => {
    if (level > 50) return 'text-emerald-500';
    if (level > 20) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex h-screen bg-slate-100 p-4 gap-4 font-sans">
      
      {/* LEFT SECTION (2/3): MAP & STATUS */}
      <div className="w-2/3 flex flex-col gap-4">
        
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-800 text-white p-3 font-semibold text-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              WebGL/Canvas Map
            </div>
            <span className="text-xs text-slate-300">20x20 Grid</span>
          </div>
          
          <div className="p-4 bg-slate-50 flex justify-center items-center h-[60vh]">
            <canvas 
              ref={canvasRef}
              width={800}
              height={800}
              className="h-full aspect-square bg-white border-2 border-slate-200 rounded-lg shadow-inner"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 flex-grow flex flex-col overflow-hidden">
          <div className="bg-slate-100 text-slate-700 p-3 font-semibold text-sm border-b border-slate-200 flex justify-between items-center">
            Robot Status
            <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{Object.keys(robots).length} Active</span>
          </div>
          <div className="p-3 overflow-y-auto space-y-2 flex-grow">
            {Object.values(robots).length === 0 ? (
              <div className="text-sm text-slate-400 text-center mt-4">No robots connected</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.values(robots).map(robot => (
                  <div key={`status-${robot.id}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: robot.color }}></div>
                      <span className="font-bold text-slate-700 text-sm">{robot.id}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${getBatteryColor(robot.battery)}`}>
                        {robot.battery}%
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {robot.status ? robot.status : 'FREE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (1/3): TASK QUEUE */}
      <div className="w-1/3 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
        
        <div className="bg-slate-800 text-white p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-lg">Task Queue</h2>
          <div className="flex gap-2">
            <button 
              className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-sm rounded-lg transition-colors"
              onClick={() => console.log("Task history clicked")}
            >
              History
            </button>
            <button 
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 font-semibold text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <span>+</span> Add Task
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-grow bg-slate-50">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <p className="text-sm text-center">Queue is empty.<br/>Add a task to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{task.id}</span>
                      {task.priority && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold">PRIORITY</span>}
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ml-auto">{task.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pickup</span>
                      <span className="font-semibold text-slate-700 text-sm">{task.pickup}</span>
                    </div>
                    <div className="text-slate-300">→</div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Drop</span>
                      <span className="font-semibold text-slate-700 text-sm">{task.drop}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white p-4 font-semibold text-lg">Create New Task</div>
            <form onSubmit={handleSubmitTask} className="p-6 space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Pickup Location</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={taskForm.pickup}
                  onChange={(e) => setTaskForm({...taskForm, pickup: e.target.value})}
                >
                  <option value="Pickup A">Pickup A</option>
                  <option value="Pickup B">Pickup B</option>
                  <option value="Pickup C">Pickup C</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Drop Location</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={taskForm.drop}
                  onChange={(e) => setTaskForm({...taskForm, drop: e.target.value})}
                >
                  <option value="Drop A">Drop A</option>
                  <option value="Drop B">Drop B</option>
                  <option value="Drop C">Drop C</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">High Priority</span>
                  <span className="text-xs text-slate-400">Jump to the front of the queue</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow transition-colors"
                >
                  Dispatch Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}