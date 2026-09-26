import { getStatusBadge } from '../utils';

export default function TaskQueue({ liveTasks, onOpenHistory, onOpenDispatch }) {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
      <div className="bg-slate-800 text-white p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Task Queue & Bids</h2>
          <span className="text-xs text-slate-400">{liveTasks.length} Active</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 text-sm rounded transition-colors font-medium"
            onClick={onOpenHistory}
          >
            History
          </button>
          <button 
            className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-400 font-semibold text-sm rounded shadow transition-colors flex items-center justify-center gap-1"
            onClick={onOpenDispatch}
          >
            <span>+</span> Add Task
          </button>
        </div>
      </div>

      <div className="p-3 overflow-y-auto flex-grow bg-slate-50">
        {liveTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1.5">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p className="text-xs text-center">No active tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {liveTasks.map((task) => (
              <div key={task.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {task.id}
                    </span>
                    {task.priority && (
                      <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        PRIORITY
                      </span>
                    )}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                  
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700 truncate">{task.pickup}</span>
                  <span className="text-slate-300 mx-1 flex-shrink-0">→</span>
                  <span className="font-semibold text-slate-700 truncate">{task.drop}</span>
                </div>
                  
                <div className="border-t border-slate-100 pt-1.5">
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex justify-between items-center">
                    <span>{task.assignedTo ? 'Winner' : 'Waiting'}</span>
                    {task.assignedTo && (
                      <span className="text-blue-600 font-bold">{task.assignedTo}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}