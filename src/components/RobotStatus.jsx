export default function RobotStatus({ robots }) {
  const robotList = Object.values(robots);
  
  return (
    <div className="w-full h-auto min-h-[160px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
      <div className="bg-white text-slate-800 p-4 font-bold text-sm border-b border-slate-100 flex justify-between items-center">
        Fleet Battery & Status
        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
          {robotList.length} Active
        </span>
      </div>
      <div className="p-4 overflow-y-auto flex-grow bg-slate-50/50">
        {robotList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium">
            No robots connected to fleet
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {robotList.map((robot) => {
              const battery = robot.battery !== undefined ? robot.battery : 100;
              const batLevel = Math.max(0, Math.min(100, battery));
              const batColorClass = batLevel > 50 ? 'bg-emerald-500' : batLevel > 20 ? 'bg-amber-500' : 'bg-rose-500';

              return (
                <div key={`status-${robot.id}`} className="flex flex-col p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: robot.color || '#3b82f6' }}></div>
                      <span className="font-extrabold text-slate-700 text-sm">{robot.id}</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${robot.is_busy ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      {robot.is_busy ? 'Busy' : 'Free'}
                    </span>
                  </div>
                  
                  {/* Battery Bar & Percentage */}
                  <div className="flex items-center gap-3">
                    <div className="flex-grow h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full ${batColorClass} transition-all duration-1000 ease-out`} 
                        style={{ width: `${batLevel}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-9 text-right tabular-nums">
                      {Math.round(batLevel)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}