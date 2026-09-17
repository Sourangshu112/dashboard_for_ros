import { useEffect, useRef } from 'react';
// Import the costmap directly (adjust the path to wherever you placed it)
import costmap from '../costmap.json'; 

const amrIcon = new Image();
amrIcon.src = '/amr.svg';

export default function WarehouseMap({ robots }) { 
  const canvasRef = useRef(null); 

  useEffect(() => {
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    const width = canvas.width; 
    const height = canvas.height; 

    // 1. Extract Grid Data
    const grid = costmap.grid;
    const rows = grid.length;
    const cols = grid[0].length;
    const resolution = costmap.resolution || 1.0;
    const originX = costmap.origin ? costmap.origin[0] : 0.0;
    const originY = costmap.origin ? costmap.origin[1] : 0.0;

    // 2. Calculate dynamic scaling (replicates self.scale from Tkinter)[cite: 7]
    const scaleX = width / cols;
    const scaleY = height / rows;

    // 3. Perfect Coordinate Mapping (replicates world_to_grid math)[cite: 2]
    const mapX = (wx) => ((parseFloat(wx) - originX) / resolution) * scaleX; 
    const mapY = (wy) => height - (((parseFloat(wy) - originY) / resolution) * scaleY);

    const drawCanvas = () => {
      ctx.clearRect(0, 0, width, height); 
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // --- Draw the Costmap Obstacles ---
      ctx.fillStyle = '#374151'; // Dark grey for obstacles[cite: 7]
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] !== 0) {
            // Draw a rectangle for every obstacle cell
            ctx.fillRect(x * scaleX, y * scaleY, scaleX + 0.5, scaleY + 0.5); 
            // (+0.5 prevents tiny white grid lines between cells due to sub-pixel rendering)
          }
        }
      }

      // --- Draw Trajectories and Robots ---
      Object.values(robots).forEach((robot) => { 
        if (robot.path && robot.path.length > 0) {
          ctx.beginPath(); 
          ctx.strokeStyle = '#9c27b0'; // Purple path[cite: 7]
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          
          ctx.moveTo(mapX(robot.x), mapY(robot.y));
          robot.path.forEach(pt => ctx.lineTo(mapX(pt[0]), mapY(pt[1])));
          ctx.stroke(); 

          const finalPoint = robot.path[robot.path.length - 1];
          ctx.beginPath();
          ctx.arc(mapX(finalPoint[0]), mapY(finalPoint[1]), 6, 0, 2 * Math.PI); 
          ctx.fillStyle = '#ef6c00'; // Orange destination[cite: 7]
          ctx.fill();
          ctx.strokeStyle = '#1e293b'; 
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const px = mapX(robot.x);
        const py = mapY(robot.y);

        if (amrIcon.complete) {
          ctx.save();
          ctx.translate(px, py);
          
          // Note: Because we removed the old Y-inversion, you may need 
          // to remove the negative sign here depending on your SVG's orientation
          ctx.rotate(-robot.theta); 

          ctx.drawImage(amrIcon, -30, -30, 60, 60);
          ctx.restore();
        }

        ctx.fillStyle = '#1e293b'; 
        ctx.font = 'bold 14px sans-serif'; 
        ctx.fillText(robot.id, px + 18, py + 5); 
      });
    };

    if (!amrIcon.complete) amrIcon.onload = drawCanvas;
    drawCanvas();

  }, [robots]); 

  return (
    <div className="w-1/2 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col"> 
      <div className="bg-slate-800 text-white p-3 font-semibold text-sm flex justify-between items-center">
        <div className="flex items-center gap-2"> 
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div> 
          AMR Fleet Map
        </div>
      </div>
      <div className="p-4 bg-slate-50 flex justify-center items-center flex-grow min-h-0"> 
        {/* Set dimensions to exactly match your Tkinter grid ratio or leave it responsive */}
        <canvas ref={canvasRef} width={680} height={1040} className="h-full max-w-full bg-white border-2 border-slate-200 rounded-lg shadow-inner" /> 
      </div>
    </div> 
  );
}