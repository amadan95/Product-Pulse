import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Review } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RatingChartProps {
  ratings: Record<string, number>;
}

const RatingChart: React.FC<RatingChartProps> = ({ ratings }) => {
  // Create labels and data arrays
  const labels = ['1', '2', '3', '4', '5'];
  const data = labels.map(rating => ratings[rating] || 0);
  
  // Calculate total reviews
  const totalReviews = data.reduce((sum, count) => sum + count, 0);
  
  // Chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Reviews',
        data,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',   // 1 star - red
          'rgba(249, 115, 22, 0.7)',  // 2 stars - orange
          'rgba(234, 179, 8, 0.7)',   // 3 stars - yellow
          'rgba(132, 204, 22, 0.7)',  // 4 stars - light green
          'rgba(34, 197, 94, 0.7)',   // 5 stars - green
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(132, 204, 22)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const count = context.parsed.y;
            const percentage = totalReviews > 0 
              ? ((count / totalReviews) * 100).toFixed(1) 
              : '0';
            return `${count} reviews (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Reviews'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Rating'
        }
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default RatingChart; 