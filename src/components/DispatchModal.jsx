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

    const taskData = {
      task_id: newTaskId,
      pickup: LOCATION_MAP[taskForm.pickup],
      drop: LOCATION_MAP[taskForm.drop],
      pickup_name: taskForm.pickup,
      drop_name: taskForm.drop,
      priority: taskForm.priority
    };
    
    socket.emit('issue_task', taskData);

    setTasks((prev) => [
      ...prev,
      {
        id: newTaskId,
        pickup: taskForm.pickup,
        drop: taskForm.drop,
        priority: taskForm.priority,
        status: 'Bidding',
        bids: {},
        assignedTo: null
      }
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-800 text-white p-3 font-semibold text-base">Dispatch Task</div>
        <form onSubmit={handleSubmitTask} className="p-4 space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Pickup Location</label>
            <select 
              className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={taskForm.pickup}
              onChange={(e) => setTaskForm({ ...taskForm, pickup: e.target.value })}
            >
              <option value="Pickup A">Pickup A</option>
              <option value="Pickup B">Pickup B</option>
              <option value="Pickup C">Pickup C</option>
              <option value="Pickup D">Pickup D</option>
              <option value="Pickup E">Pickup E</option>
              <option value="Pickup F">Pickup F</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Drop Location</label>
            <select 
              className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={taskForm.drop}
              onChange={(e) => setTaskForm({ ...taskForm, drop: e.target.value })}
            >
              <option value="Drop A">Drop A</option>
              <option value="Drop B">Drop B</option>
              <option value="Drop C">Drop C</option>
              <option value="Drop D">Drop D</option>
              <option value="Drop E">Drop E</option>
              <option value="Drop F">Drop F</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">High Priority</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              className="flex-1 px-3 py-2 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-50 font-semibold transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold shadow transition-colors"
            >
              Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}