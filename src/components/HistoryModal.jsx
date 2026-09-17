import { getStatusBadge } from '../utils';

export default function HistoryModal({ tasks, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="bg-slate-800 text-white p-4 font-semibold flex justify-between items-center">
          <span>Fleet Task History</span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-auto flex-grow p-4 bg-slate-50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-200 text-slate-700 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-3 text-xs uppercase font-bold">Task ID</th>
                <th className="p-3 text-xs uppercase font-bold">Route</th>
                <th className="p-3 text-xs uppercase font-bold">Status</th>
                <th className="p-3 text-xs uppercase font-bold">AMR</th>
                <th className="p-3 text-xs uppercase font-bold">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-sm text-slate-500">No tasks recorded in the ledger.</td>
                </tr>
              ) : (
                tasks.slice().reverse().map((task) => (
                  <tr key={`hist-${task.id}`} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {task.id}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-600 font-semibold">
                      {task.pickup} <span className="text-slate-300 mx-1">→</span> {task.drop}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-bold text-blue-600">
                      {task.assignedTo || '-'}
                    </td>
                    <td className="p-3 text-xs text-slate-500 font-mono">
                      {task.completionTime || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}