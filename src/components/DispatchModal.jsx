import { useState } from 'react';
import { LOCATION_MAP } from '../utils';

export default function DispatchModal({ onClose, socket, setTasks }) {
  const [taskForm, setTaskForm] = useState({
    pickup: 'Pickup A',
    drop: 'Drop A',
    priority: false
  });

  const handleSubmitTask = (e) => {
    e.preventDefault();
    const newTaskId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Automatically generate the "A->G" route string for the backend intercept
    const pickupLetter = taskForm.pickup.replace('Pickup ', '');
    const dropLetter = taskForm.drop.replace('Drop ', '');
    const routeString = `${pickupLetter}->${dropLetter}`;

    const taskData = {
      task_id: newTaskId,
      pickup: LOCATION_MAP[taskForm.pickup],
      drop: LOCATION_MAP[taskForm.drop],
      pickup_name: taskForm.pickup,
      drop_name: taskForm.drop,
      priority: taskForm.priority,
      route: routeString // <-- This triggers the specific robot override in Python
    };
    
    socket.emit('issue_task', taskData);

    setTasks((prev) => [
      ...prev,
      {
        id: newTaskId,
        pickup: taskForm.pickup,
        drop: taskForm.drop,
        priority: taskForm.priority,
        status: 'Queued',
        bids: {},
        assignedTo: null
      }
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 transform scale-100 transition-transform">
        
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-800">New Delivery</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
          
          <div className="relative pl-7 space-y-5">
            <div className="absolute left-[11px] top-5 bottom-5 w-0.5 bg-slate-200 rounded-full"></div>
            
            <div className="relative">
              <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[3px] border-blue-500 bg-white z-10 shadow-sm"></div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pickup Location</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none shadow-sm"
                value={taskForm.pickup}
                onChange={(e) => setTaskForm({ ...taskForm, pickup: e.target.value })}
              >
                <optgroup label="Pickups">
                  <option value="Pickup A">Pickup A</option>
                  <option value="Pickup B">Pickup B</option>
                  <option value="Pickup C">Pickup C</option>
                  <option value="Pickup D">Pickup D</option>
                  <option value="Pickup E">Pickup E</option>
                </optgroup>
              </select>
            </div>

            <div className="relative">
              <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[3px] border-emerald-500 bg-white z-10 shadow-sm"></div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Drop / Charge Location</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none shadow-sm"
                value={taskForm.drop}
                onChange={(e) => setTaskForm({ ...taskForm, drop: e.target.value })}
              >
                <optgroup label="Drops">
                  <option value="Drop A">Drop A</option>
                  <option value="Drop B">Drop B</option>
                  <option value="Drop C">Drop C</option>
                  <option value="Drop D">Drop D</option>
                  <option value="Drop E">Drop E</option>
                  <option value="Drop F">Drop F</option>
                  <option value="Drop G">Drop G</option>
                  <option value="Drop H">Drop H</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Priority Dispatch</span>
              <span className="text-[10px] font-medium text-slate-400">Moves task to front of queue</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            Dispatch Delivery
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}