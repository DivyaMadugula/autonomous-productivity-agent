import "../styles/schedule.css";
import { useEffect, useState } from "react";
import API from "../api/api";

const Schedule = () => {
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const fetchSchedule = async (date) => {
    try {
      const res = await API.get("/schedule", {
        params: { selected_date: date },
      });
      setSchedule(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }

    return dates;
  };

  const weekDates = generateWeekDates();
  const addToCalendar = (task, slot) => {
  const date = new Date(selectedDate);

  let hour = 9; // default morning

  if (slot === "afternoon") hour = 14;
  if (slot === "evening") hour = 19;

  const start = new Date(date.setHours(hour, 0, 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatDate = (d) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE
    &text=${encodeURIComponent(task.title)}
    &dates=${formatDate(start)}/${formatDate(end)}
    &details=${encodeURIComponent("Scheduled via Aura AI")}
    &sf=true
    &output=xml`;

  window.open(url, "_blank");
};

  return (
    <>
      <div className="schedule-header">
        <h1>Autonomous Personal Productivity AI</h1>
      </div>

      {/* Date Selector */}
      <div className="date-selector card">
        {weekDates.map((date) => {
          const formatted = date.toISOString().split("T")[0];
          const isActive = formatted === selectedDate;

          return (
            <div
              key={formatted}
              className={`date-pill ${isActive ? "active" : ""}`}
              onClick={() => setSelectedDate(formatted)}
            >
              <span>{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <strong>{date.getDate()}</strong>
            </div>
          );
        })}
      </div>

      {/* Schedule Blocks */}
      <div className="schedule-main">
        {["morning", "afternoon", "evening"].map((slot) => (
          <div key={slot} className="slot-card card">
            <h3>{slot.charAt(0).toUpperCase() + slot.slice(1)}</h3>

            {schedule[slot]?.length === 0 ? (
              <p className="empty-slot">No tasks</p>
            ) : (
              schedule[slot]?.map((task) => (
                <div className={`task-card ${task.status}`}>
  <span>{task.title}</span>

  <button
    className="calendar-btn"
    onClick={() => addToCalendar(task, slot)}
  >
    📅 Add to Calendar
  </button>
</div>
              ))
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Schedule;