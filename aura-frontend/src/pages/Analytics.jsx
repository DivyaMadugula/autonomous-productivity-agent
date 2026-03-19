import "../styles/analytics.css";
import { useEffect, useState } from "react";
import API from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return <div className="card">Loading analytics...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Track your productivity trends and insights</p>
      </div>

      {/* Top Stats */}
      <div className="analytics-stats">
        <div className="card stat-card">
          <h4>Avg Completion Rate</h4>
          <h2>{data.avg_completion_rate}%</h2>
          <span className="trend up">Last 7 days</span>
        </div>

        <div className="card stat-card">
          <h4>Weekly Focus Time</h4>
          <h2>{data.weekly_focus_hours}h</h2>
          <span className="trend">Last 7 days</span>
        </div>

        <div className="card stat-card">
          <h4>Goals Achieved</h4>
          <h2>{data.goals_achieved}</h2>
          <span className="trend">This week</span>
        </div>

        <div className="card stat-card">
          <h4>Best Day</h4>
          <h2>{data.best_day}</h2>
          <span className="trend up">Peak performance</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-main">
        {/* Weekly Chart */}
        <div className="card chart-card">
          <h3>Weekly Productivity</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.weekly_productivity}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f59e0b" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="card heatmap-card">
  <h3>Activity Heatmap</h3>

  <div className="heatmap-wrapper">

    {/* Weekday Labels */}
    <div className="heatmap-days">
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
        <span key={day}>{day}</span>
      ))}
    </div>

    {/* Heatmap Grid */}
    <div className="heatmap-grid">
  {Array.from({ length: 7 }).map((_, rowIndex) =>
    Array.from({ length: 7 }).map((_, colIndex) => {
      const index = rowIndex * 7 + colIndex;
      const value = data.heatmap[index] || 0;

      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`heatmap-circle intensity-${value}`}
        />
      );
    })
  )}
</div>
  </div>

  {/* Legend */}
  <div className="heatmap-legend">
    <span>Less</span>
    <div className="legend-scale">
      {[0,1,2,3,4].map(i => (
        <div key={i} className={`heatmap-circle intensity-${i}`} />
      ))}
    </div>
    <span>More</span>
  </div>
</div>
      </div>

      {/* AI Generated Insights */}
      <div className="analytics-insights">
        <h3>AI Generated Insights</h3>

        <div className="insights-grid">
          <div className="card insight-card">
            <h4>⚡ Peak Hours</h4>
            <p>{data.insights?.peak_hours}</p>
          </div>

          <div className="card insight-card">
            <h4>📊 Task Patterns</h4>
            <p>{data.insights?.task_pattern}</p>
          </div>

          <div className="card insight-card">
            <h4>📈 Weekly Trend</h4>
            <p>{data.insights?.weekly_trend}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;