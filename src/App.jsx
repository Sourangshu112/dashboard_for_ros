import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
  transports: ['websocket', 'polling'],
});

const GRID_MAX_X = 10;
const GRID_MAX_Y = 10;

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 55%)`;
};

export default function FleetDashboard() {
  const [robots, setRobots] = useState({});

  // -----------------------------
  // TASK STATE
  // -----------------------------

  const [tasks, setTasks] = useState([]);

  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const [taskForm, setTaskForm] = useState({
    pickup: '',
    drop: '',
    priority: 'Medium',
  });

  // -----------------------------
  // SOCKET CONNECTION
  // -----------------------------

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to ROS 2 Backend!');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
    });

    // -----------------------------
    // ROBOT TELEMETRY
    // -----------------------------

    socket.on('fleet_update', (data) => {
      setRobots((prev) => {
        const existingRobot = prev[data.id];

        const robotColor = existingRobot
          ? existingRobot.color
          : generateRandomColor();

        return {
          ...prev,
          [data.id]: {
            ...data,
            color: robotColor,
          },
        };
      });
    });

    // -----------------------------
    // TASK UPDATE FROM BACKEND
    // -----------------------------

    socket.on('task_update', (data) => {
      console.log('Task update received:', data);

      setTasks((prevTasks) => {
        const existingTask = prevTasks.find(
          (task) => task.task_id === data.task_id
        );

        if (existingTask) {
          return prevTasks.map((task) =>
            task.task_id === data.task_id
              ? { ...task, ...data }
              : task
          );
        }

        return [...prevTasks, data];
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('fleet_update');
      socket.off('task_update');
    };
  }, []);

  // -----------------------------
  // BATTERY COLORS
  // -----------------------------

  const getBatteryTextColor = (level) => {
    if (level > 50) return 'text-emerald-500';
    if (level > 20) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBatteryBgColor = (level) => {
    if (level > 50) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // -----------------------------
  // ADD TASK
  // -----------------------------

  const handleAddTask = () => {
    if (!taskForm.pickup || !taskForm.drop) {
      alert('Please enter pickup and drop points.');
      return;
    }

    const task = {
      task_id: `TASK-${Date.now()}`,
      pickup: taskForm.pickup,
      drop: taskForm.drop,
      priority: taskForm.priority,
      status: 'Queued',
      robot_id: null,
    };

    console.log('Sending task to backend:', task);

    // Send task to backend
    socket.emit('add_task', task);

    // Add task immediately to UI
    setTasks((prevTasks) => [...prevTasks, task]);

    // Clear form
    setTaskForm({
      pickup: '',
      drop: '',
      priority: 'Medium',
    });

    // Close popup
    setShowTaskPopup(false);
  };

  // -----------------------------
  // DELETE TASK FROM LOCAL QUEUE
  // -----------------------------

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.task_id !== taskId)
    );

    socket.emit('cancel_task', {
      task_id: taskId,
    });
  };

  // -----------------------------
  // PRIORITY STYLE
  // -----------------------------

  const getPriorityStyle = (priority) => {
    if (priority === 'High') {
      return 'bg-rose-100 text-rose-600';
    }

    if (priority === 'Medium') {
      return 'bg-amber-100 text-amber-600';
    }

    return 'bg-emerald-100 text-emerald-600';
  };

  // -----------------------------
  // STATUS STYLE
  // -----------------------------

  const getStatusStyle = (status) => {
    if (status === 'Completed') {
      return 'bg-emerald-100 text-emerald-600';
    }

    if (status === 'In Progress') {
      return 'bg-blue-100 text-blue-600';
    }

    if (status === 'Assigned') {
      return 'bg-purple-100 text-purple-600';
    }

    return 'bg-slate-200 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="bg-slate-800 text-white rounded-2xl shadow-xl p-5 mb-6 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">
            ROS 2 Fleet Dashboard
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Real-time robot fleet management
          </p>
        </div>

        <button
          onClick={() => setShowTaskPopup(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition"
        >
          + Add Task
        </button>

      </div>


      {/* ========================================= */}
      {/* MAIN DASHBOARD */}
      {/* ========================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================================= */}
        {/* LIVE MAP */}
        {/* ======================================= */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200 overflow-hidden">

          <div className="bg-slate-800 text-white p-4 font-semibold text-lg flex justify-between items-center">

            <div className="flex items-center gap-2">

              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>

              Live Fleet Map

            </div>

            <span className="text-sm font-normal text-slate-300">
              Scale: {GRID_MAX_X}m × {GRID_MAX_Y}m
            </span>

          </div>


          {/* MAP */}

          <div
            className="relative h-[550px] bg-slate-50 overflow-hidden m-6 border-2 border-slate-200 rounded-xl shadow-inner"
            style={{
              backgroundImage:
                'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '10% 10%',
            }}
          >

            <div className="absolute left-1 bottom-1 text-xs text-slate-400 font-mono bg-white/80 px-1 rounded">
              (0,0)
            </div>

            <div className="absolute right-1 top-1 text-xs text-slate-400 font-mono">
              (10,10)
            </div>


            {/* ROBOTS */}

            {Object.values(robots).map((robot) => {

              const x = Number(robot.x) || 0;
              const y = Number(robot.y) || 0;
              const battery = Number(robot.battery) || 0;

              const leftPercent = Math.min(
                Math.max((x / GRID_MAX_X) * 100, 0),
                100
              );

              const bottomPercent = Math.min(
                Math.max((y / GRID_MAX_Y) * 100, 0),
                100
              );

              return (

                <div
                  key={robot.id}
                  className="absolute transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                  style={{
                    left: `${leftPercent}%`,
                    bottom: `${bottomPercent}%`,
                  }}
                >

                  {/* Robot dot */}

                  <div
                    className="w-8 h-8 border-4 border-white rounded-full shadow-lg relative z-10"
                    style={{
                      backgroundColor: robot.color,
                    }}
                  >

                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-50"
                      style={{
                        backgroundColor: robot.color,
                      }}
                    ></div>

                  </div>


                  {/* Robot label */}

                  <div className="mt-2 bg-slate-800 text-white text-xs px-3 py-1 rounded-lg shadow-lg font-mono z-20">
                    {robot.id}
                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* ======================================= */}
        {/* RIGHT SIDE */}
        {/* ======================================= */}

        <div className="space-y-6">

          {/* ===================================== */}
          {/* FLEET STATUS */}
          {/* ===================================== */}

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

            <div className="bg-slate-800 text-white p-4 font-semibold text-lg flex justify-between items-center">

              <span>
                Fleet Status
              </span>

              <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                {Object.keys(robots).length} Online
              </span>

            </div>


            <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">

              {Object.values(robots).length === 0 ? (

                <div className="text-center text-slate-400 py-8">
                  Waiting for telemetry data...
                </div>

              ) : (

                Object.values(robots).map((robot) => {

                  const battery = Number(robot.battery) || 0;
                  const x = Number(robot.x) || 0;
                  const y = Number(robot.y) || 0;

                  return (

                    <div
                      key={robot.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm"
                    >

                      <div className="flex justify-between items-center mb-3">

                        <div className="flex items-center gap-3">

                          <div
                            className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-200"
                            style={{
                              backgroundColor: robot.color,
                            }}
                          ></div>

                          <span className="font-bold text-slate-700">
                            {robot.id}
                          </span>

                        </div>

                        <span
                          className={`font-bold ${getBatteryTextColor(
                            battery
                          )}`}
                        >
                          {battery}%
                        </span>

                      </div>


                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">

                        <div className="bg-white px-3 py-2 rounded-lg border text-center">
                          <span className="text-slate-400">
                            X
                          </span>

                          <div className="font-mono font-semibold">
                            {x.toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-white px-3 py-2 rounded-lg border text-center">
                          <span className="text-slate-400">
                            Y
                          </span>

                          <div className="font-mono font-semibold">
                            {y.toFixed(2)}
                          </div>
                        </div>

                      </div>


                      {/* Battery */}

                      <div className="mt-3">

                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">

                          <div
                            className={`h-2 rounded-full ${getBatteryBgColor(
                              battery
                            )} transition-all duration-500`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, battery)
                              )}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>

                  );
                })

              )}

            </div>

          </div>


          {/* ===================================== */}
          {/* QUEUED TASKS */}
          {/* ===================================== */}

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

            <div className="bg-slate-800 text-white p-4 font-semibold text-lg flex justify-between items-center">

              <span>
                Queued Tasks
              </span>

              <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                {tasks.length}
              </span>

            </div>


            <div className="p-4 max-h-[450px] overflow-y-auto">

              {tasks.length === 0 ? (

                <div className="text-center text-slate-400 py-8">
                  No tasks in queue
                </div>

              ) : (

                <div className="space-y-3">

                  {tasks.map((task) => (

                    <div
                      key={task.task_id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                    >

                      {/* Task Header */}

                      <div className="flex justify-between items-center mb-3">

                        <span className="font-bold text-slate-700">
                          {task.task_id}
                        </span>

                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                      </div>


                      {/* Pickup */}

                      <div className="text-sm mb-2">

                        <span className="text-slate-400">
                          Pickup:
                        </span>

                        <span className="font-semibold text-slate-700 ml-2">
                          {task.pickup}
                        </span>

                      </div>


                      {/* Drop */}

                      <div className="text-sm mb-3">

                        <span className="text-slate-400">
                          Drop:
                        </span>

                        <span className="font-semibold text-slate-700 ml-2">
                          {task.drop}
                        </span>

                      </div>


                      {/* Status */}

                      <div className="flex justify-between items-center">

                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>

                        {task.robot_id && (
                          <span className="text-xs text-slate-500">
                            Robot: {task.robot_id}
                          </span>
                        )}

                        {!task.robot_id && (
                          <button
                            onClick={() =>
                              handleDeleteTask(task.task_id)
                            }
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            Cancel
                          </button>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ========================================= */}
      {/* ADD TASK POPUP */}
      {/* ========================================= */}

      {showTaskPopup && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* Popup Header */}

            <div className="bg-slate-800 text-white p-5 flex justify-between items-center">

              <div>

                <h2 className="text-xl font-bold">
                  Add New Task
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Create a pickup and drop task
                </p>

              </div>

              <button
                onClick={() => setShowTaskPopup(false)}
                className="text-slate-300 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>


            {/* Form */}

            <div className="p-6 space-y-5">

              {/* Pickup */}

              <div>

                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Pickup Point
                </label>

                <input
                  type="text"
                  placeholder="Example: A1"
                  value={taskForm.pickup}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      pickup: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />

              </div>


              {/* Drop */}

              <div>

                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Drop Point
                </label>

                <input
                  type="text"
                  placeholder="Example: B4"
                  value={taskForm.drop}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      drop: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />

              </div>


              {/* Priority */}

              <div>

                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Priority
                </label>

                <select
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="High">
                    🔴 High
                  </option>

                  <option value="Medium">
                    🟡 Medium
                  </option>

                  <option value="Low">
                    🟢 Low
                  </option>

                </select>

              </div>


              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() => setShowTaskPopup(false)}
                  className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold"
                >
                  Add Task
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}