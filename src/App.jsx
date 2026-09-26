import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LOCATION_MAP, generateRandomColor } from './utils';
import WarehouseMap from './components/WarehouseMap';
import TaskQueue from './components/TaskQueue';
import RobotStatus from './components/RobotStatus';
import DispatchModal from './components/DispatchModal';
import HistoryModal from './components/HistoryModal';

const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });

export default function FleetDashboard() {
  const [robots, setRobots] = useState({});
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now()); 
  
  // --------------------------------------------------------
  // SOCKET CONNECTION & EVENT LISTENERS
  // --------------------------------------------------------
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to ROS 2 Backend!');
      socket.emit('request_initial_state');
    });

    socket.on('initial_state_response', (data) => {
      if (!data || !data.tasks) return;
      
      const formattedTasks = data.tasks.map((dbTask) => {
        const payload = dbTask.Task || {};
        let pickupLabel = payload.pickup_name || payload.pickup;
        let dropLabel = payload.drop_name || payload.drop;

        if (Array.isArray(pickupLabel)) {
          const match = Object.entries(LOCATION_MAP).find(
            ([_, coords]) => coords[0] === pickupLabel[0] && coords[1] === pickupLabel[1]
          );
          pickupLabel = match ? match[0] : `(${pickupLabel.join(', ')})`;
        }
        if (Array.isArray(dropLabel)) {
          const match = Object.entries(LOCATION_MAP).find(
            ([_, coords]) => coords[0] === dropLabel[0] && coords[1] === dropLabel[1]
          );
          dropLabel = match ? match[0] : `(${dropLabel.join(', ')})`;
        }

        let taskStatus = 'Queued';
        if (dbTask.Task_completion_time) {
          taskStatus = 'Completed';
        } else if (dbTask.Task_starting_time) {
          taskStatus = 'In Progress';
        } else if (dbTask.Amr_completed) {
          taskStatus = 'Assigned';
        }

        return {
          id: dbTask.Task_id,
          pickup: pickupLabel || 'Pickup A',
          drop: dropLabel || 'Drop A',
          priority: payload.priority || false,
          status: taskStatus,
          assignedTo: dbTask.Amr_completed || null,
          bids: {},
          issueTime: dbTask.Task_issue_time || null,
          completionTime: dbTask.Task_completion_time || null
        };
      });

      setTasks(formattedTasks);
    });

    socket.on('fleet_update', (data) => {
      setRobots((prev) => {
        const existingRobot = prev[data.id];
        const robotColor = existingRobot ? existingRobot.color : generateRandomColor();
        return { 
          ...prev, 
          [data.id]: { 
            ...(existingRobot || {}), 
            ...data, 
            color: robotColor 
          } 
        };
      });
    });
    // console.log(robots)
    socket.on('task_bid', (bidData) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === bidData.task_id) {
            const updatedBids = {
              ...(task.bids || {}),
              [bidData.robot_id]: bidData.bid_cost
            };
            return {
              ...task,
              status: task.status === 'Completed' ? 'Completed' : 'Bidding',
              bids: updatedBids
            };
          }
          return task;
        })
      );
    });

    socket.on('trajectory_update', (data) => {
      setRobots((prev) => {
        if (!prev[data.id]) return prev;
        return {
          ...prev,
          [data.id]: { ...prev[data.id], path: data.path }
        };
      });
    });

    return () => {
      socket.off('connect');
      socket.off('fleet_update');
      socket.off('task_bid');
      socket.off('initial_state_response');
      socket.off('trajectory_update');
    };
  }, []);

  // Filter tasks
  const liveTasks = tasks.filter(task => {
    if (task.status !== 'Completed') return true;
    if (!task.completionTime) return true;
    const compDate = new Date(task.completionTime.replace(' ', 'T')).getTime();
    return (now - compDate) < 5000; 
  });

  return (
    <div className="flex flex-col h-screen bg-slate-100 p-4 gap-4 font-sans">
      <button onClick={() => {
        if(window.confirm("Initiate Hardcoded Collision Reroute Demo?")) {
          socket.emit('trigger_sih_prototype');
          }
       }}
      className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 z-50 font-bold border-2 border-white">
  ▶ RUN PROTOTYPE DEMO
</button>
      <div className="flex flex-row gap-4 flex-grow min-h-0">
        <WarehouseMap robots={robots} />
        <div className='flex flex-col w-1/2 gap-4'>
          <TaskQueue 
            liveTasks={liveTasks} 
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onOpenDispatch={() => setIsModalOpen(true)}
          />
          <RobotStatus robots={robots} />
        </div>
      </div>

      {isModalOpen && (
        <DispatchModal 
          onClose={() => setIsModalOpen(false)} 
          socket={socket} 
          setTasks={setTasks} 
        />
      )}
      
      {isHistoryModalOpen && (
        <HistoryModal 
          tasks={tasks} 
          onClose={() => setIsHistoryModalOpen(false)} 
        />
      )}
    </div>
  );
}
