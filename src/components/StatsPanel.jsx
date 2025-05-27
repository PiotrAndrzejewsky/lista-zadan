import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';

Chart.register(ArcElement, Tooltip);

const StatsPanel = ({ tasks, statuses }) => {
  // policz ile w każdym statusie
  const counts = statuses.map(s => tasks.filter(t => t.status === s.id).length);

  const data = {
    labels: statuses.map(s => s.title),
    datasets: [{
      data: counts,
      backgroundColor: statuses.map(s => s.color),
      hoverOffset: 4
    }]
  };

  const options = {
    cutout: '0%',
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  return (
    <div className="stats-panel">
      <h3>Statystyki</h3>
      <div className="stats-content">
        <div className="chart-wrapper">
          <Doughnut data={data} options={options} />
        </div>
        <div className="stats-legend">
          {statuses.map((s, i) => (
            <div key={s.id} className="stats-legend-item">
              <span 
                className="stats-legend-color" 
                style={{ backgroundColor: s.color }} 
              />
              <span>{s.title}: {counts[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
