import { getBatteryColor } from '../utils';

export default function RobotStatus({ robots }) {
  const robotList = Object.values(robots);
  
  return (
    <div className="w-full h-32 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden shrink-0">
      <div className="bg-slate-100 text-slate-700 p-3 font-semibold text-sm border-b border-slate-200 flex justify-between items-center">
        Robot Status
        <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{robotList.length} Active</span>
      </div>
      <div className="p-3 overflow-y-auto flex-grow">
        {robotList.length === 0 ? (
          <div className="text-sm text-slate-400 text-center mt-2">No robots connected</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {robotList.map((robot) => (
              <div key={`status-${robot.id}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: robot.color }}></div>
                  <span className="font-bold text-slate-700 text-sm">{robot.id}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-bold ${getBatteryColor(robot.battery)}`}>
                    {Math.round(robot.battery)}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${robot.is_busy ? 'text-blue-500' : 'text-slate-400'}`}>
                    {robot.is_busy ? `BUSY: ${robot.current_task_id}` : 'FREE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}