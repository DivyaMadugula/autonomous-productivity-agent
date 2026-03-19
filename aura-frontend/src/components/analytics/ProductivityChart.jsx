import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ProductivityChart = ({ data }) => {
  return (
    <div className="card">
      <h3>Weekly Productivity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;