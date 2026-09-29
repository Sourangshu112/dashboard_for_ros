import { useEffect, useRef, useState } from 'react';
import costmap from '../costmap.json'; 

export default function WarehouseMap({ robots }) { 
  const canvasRef = useRef(null); 
  const containerRef = useRef(null);
  
  // Zoom and Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle zooming via mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSensitivity = 0.1;
    let newScale = scale;
    
    if (e.deltaY < 0) {
      newScale += zoomSensitivity;
    } else {
      newScale -= zoomSensitivity;
    }
    
    // Clamp zoom between 1x (default) and 4x (max zoom)
    newScale = Math.min(Math.max(1, newScale), 4);
    
    // If zooming all the way out, reset the pan position to center
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    setScale(newScale);
  };

  // Handle panning via click and drag
  const handleMouseDown = (e) => {
    if (scale <= 1) return; // Only allow panning if zoomed in
    setIsDragging(true);
    dragStart.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate new position
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    // Optional: Add boundary clamping here if you want to strictly restrict panning
    // For now, we allow free panning while dragging
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach non-passive wheel listener to prevent default page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scale]);

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    const width = canvas.width; 
    const height = canvas.height; 

    const grid = costmap.grid;
    const rows = grid.length;
    const cols = grid[0].length;
    const resolution = costmap.resolution || 1.0;
    const originX = costmap.origin ? costmap.origin[0] : 0.0;
    const originY = costmap.origin ? costmap.origin[1] : 0.0;

    const scaleX = width / cols;
    const scaleY = height / rows;

    const mapX = (wx) => ((parseFloat(wx) - originX) / resolution) * scaleX; 
    const mapY = (wy) => height - (((parseFloat(wy) - originY) / resolution) * scaleY);

    const drawCanvas = () => {
      ctx.clearRect(0, 0, width, height); 
      
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      for (let i = 0; i < width; i += 80) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let j = 0; j < height; j += 80) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
      }
      ctx.setLineDash([]); 

      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] !== 0) {
            ctx.fillRect(x * scaleX + 6, y * scaleY + 6, scaleX + 0.5, scaleY + 0.5); 
          }
        }
      }

      ctx.fillStyle = '#e5e0d8'; 
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] !== 0) {
            ctx.fillRect(x * scaleX, y * scaleY, scaleX + 0.5, scaleY + 0.5); 
          }
        }
      }

      const zones = [
        { coords: [-11.5, 13.0], color: '#bfdbfe', stroke: '#3b82f6', label: 'P' },
        { coords: [1.5, 3.0], color: '#bfdbfe', stroke: '#3b82f6', label: 'P' },
        { coords: [9.5, 21.0], color: '#bfdbfe', stroke: '#3b82f6', label: 'P' },
        { coords: [10.5, 9.0], color: '#bfdbfe', stroke: '#3b82f6', label: 'P' },
        { coords: [10.0, 5.5], color: '#bfdbfe', stroke: '#3b82f6', label: 'P' },
        { coords: [11.0, -5.0], color: '#bfdbfe', stroke: '#22c55e', label: 'D' },
        { coords: [3.0, -13.0], color: '#bfdbfe', stroke: '#22c55e', label: 'D' },
        { coords: [-11.5, 9.0], color: '#bfdbfe', stroke: '#22c55e', label: 'D' },
        { coords: [-9.0, -1.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [-9.0, -6.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [-9.0, -11.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [-9.0, -16.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [-2.0, -21.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [6.0, -23.0], color: '#bbf7d0', stroke: '#22c55e', label: 'D' },
        { coords: [-13.0, -1.0], color: '#fef08a', stroke: '#eab308', label: 'C' },
        { coords: [-13.0, -6.0], color: '#fef08a', stroke: '#eab308', label: 'C' },
        { coords: [-13.0, -11.0], color: '#fef08a', stroke: '#eab308', label: 'C' }
      ];

      zones.forEach(zone => {
        const zx = mapX(zone.coords[0]);
        const zy = mapY(zone.coords[1]);
        const size = 24; 
        const radius = 6;

        ctx.fillStyle = zone.color;
        ctx.strokeStyle = zone.stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(zx - size / 2, zy - size / 2, size, size, radius);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = zone.stroke; 
        ctx.font = 'bold 13px sans-serif';
        const txtWidth = ctx.measureText(zone.label).width;
        ctx.fillText(zone.label, zx - txtWidth / 2, zy + 4.5);
      });

      const robotList = Object.values(robots);

      robotList.forEach((robot) => { 
        const rColor = robot.color || '#9c27b0';
        
        if (robot.path && robot.path.length > 0) {
          ctx.beginPath(); 
          ctx.strokeStyle = rColor;
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          
          ctx.moveTo(mapX(robot.path[0][0]), mapY(robot.path[0][1]));
          robot.path.forEach(pt => ctx.lineTo(mapX(pt[0]), mapY(pt[1])));
          ctx.stroke(); 

          const finalPoint = robot.path[robot.path.length - 1];
          const fx = mapX(finalPoint[0]);
          const fy = mapY(finalPoint[1]);
          
          ctx.beginPath();
          ctx.arc(fx, fy - 14, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(fx - 7, fy - 10);
          ctx.lineTo(fx, fy);
          ctx.lineTo(fx + 7, fy - 10);
          ctx.fillStyle = rColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(fx, fy - 14, 3, 0, Math.PI * 2); 
          ctx.fillStyle = '#ffffff'; 
          ctx.fill();
        }
      });

      robotList.forEach((robot) => {
        const px = mapX(robot.x);
        const py = mapY(robot.y);
        const rColor = robot.color || '#3b82f6';

        ctx.save();
        ctx.translate(px, py);
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 5;

        ctx.rotate(-robot.theta); 

        ctx.fillStyle = rColor;
        ctx.beginPath();
        ctx.roundRect(-14, -12, 28, 24, 6);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.roundRect(-12, -10, 24, 10, 4);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.roundRect(-6, -6, 12, 12, 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(8, -5, 6, 10, 2);
        ctx.fill();
        
        ctx.fillStyle = '#38bdf8'; 
        ctx.beginPath();
        ctx.roundRect(10, -3, 2, 6, 1);
        ctx.fill();
        
        ctx.restore();
      });

      robotList.forEach((robot) => {
        const px = mapX(robot.x);
        const py = mapY(robot.y);
        const labelX = px + 15;
        const labelY = py - 20;
        const text = robot.id;

        ctx.font = 'bold 11px sans-serif'; 
        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + 16; 
        
        ctx.fillStyle = '#1e293b'; 
        ctx.beginPath();
        ctx.roundRect(labelX, labelY - 14, boxWidth, 20, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff'; 
        ctx.fillText(text, labelX + 8, labelY + 1);
      });
    };

    drawCanvas();

  }, [robots]); 

  return (
    <div className="w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative"> 
      <div className="bg-white border-b border-slate-100 text-slate-800 p-4 font-bold text-sm flex justify-between items-center z-10 relative shadow-sm">
        <div className="flex items-center gap-2"> 
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div> 
          AMR Fleet Map
        </div>
        
        {/* Current Zoom Badge Indicator */}
        <div className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500 font-bold border border-slate-200">
          {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Map Container - Handles overflow and mouse events */}
      <div 
        ref={containerRef}
        className="p-4 bg-slate-50 flex justify-center items-center flex-grow min-h-0 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      > 
        <canvas 
          ref={canvasRef} 
          width={680} 
          height={1040} 
          className="h-full max-w-full bg-white border-2 border-slate-200 rounded-xl shadow-inner transition-transform duration-75 ease-out" 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        /> 
        
        {/* Floating Zoom Controls UI */}
        <div className="absolute bottom-6 right-6 flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <button 
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-bold text-lg border-b border-slate-100"
            onClick={() => {
              setScale(prev => Math.min(4, prev + 0.5));
            }}
          >
            +
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-bold text-lg"
            onClick={() => {
              setScale(prev => {
                const newScale = Math.max(1, prev - 0.5);
                if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset pan on zoom out
                return newScale;
              });
            }}
          >
            −
          </button>
        </div>
      </div>
    </div> 
  );
}
