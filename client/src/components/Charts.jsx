import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";

const COLORS = ["#00f5c9", "#f44336"];

export function IncomeExpensePie({ data }) {
  return (
    <>
      <h3>📊 Financial Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export function CategoryBar({ data }) {
  return (
    <>
      <h3>📊 Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export function CashFlowLine({ data }) {
  return (
    <>
      <h3>📈 Cash Flow Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="credit" name="Income" stroke="#00f5c9" strokeWidth={2} />
          <Line type="monotone" dataKey="debit" name="Expenses" stroke="#f44336" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}