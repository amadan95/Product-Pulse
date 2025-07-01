import React, { useEffect, useRef } from 'react';
import { Review } from '../types';
import Chart from 'chart.js/auto';

interface RatingTrendChartProps {
  reviews: Review[];
  className?: string;
}

const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ reviews, className = '' }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !reviews || reviews.length === 0) return;

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Helper function to safely parse dates
    const isValidDate = (date: Date): boolean => {
      return date instanceof Date && !isNaN(date.getTime());
    };

    // Group reviews by date and calculate average rating for each date
    const reviewsByDate = reviews.reduce<{ [date: string]: { sum: number; count: number } }>((acc, review) => {
      try {
        // Skip reviews without rating or date
        if (!review || (review.score === undefined && review.rating === undefined)) {
          return acc;
        }

        // Get the rating (handle both score and rating properties)
        const rating = typeof review.score === 'number' ? review.score : 
                      (typeof review.rating === 'number' ? review.rating : null);
        
        if (rating === null) {
          return acc;
        }

        // Handle date parsing
        let reviewDate: Date | null = null;
        
        if (typeof review.date === 'string') {
          reviewDate = new Date(review.date);
        } else if (review.date && typeof review.date === 'object') {
          // Check if it's already a Date object
          reviewDate = review.date as Date;
        }
        
        // Skip invalid dates
        if (!reviewDate || !isValidDate(reviewDate)) {
          console.log('Invalid date found in review:', 
            { date: review.date, rating, hasDate: !!review.date });
          return acc;
        }

        // Format date as YYYY-MM-DD
        const dateStr = reviewDate.toISOString().split('T')[0];
        
        // Add to accumulator
        if (!acc[dateStr]) {
          acc[dateStr] = { sum: 0, count: 0 };
        }
        
        acc[dateStr].sum += rating;
        acc[dateStr].count += 1;
        
        return acc;
      } catch (error) {
        console.error('Error processing review:', error);
        return acc;
      }
    }, {});

    // If no valid reviews with dates, show message
    if (Object.keys(reviewsByDate).length === 0) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No valid review dates available for chart', chartRef.current.width / 2, chartRef.current.height / 2);
      }
      return;
    }

    // Convert to arrays for Chart.js
    const dates = Object.keys(reviewsByDate).sort();
    const averageRatings = dates.map(date => {
      const { sum, count } = reviewsByDate[date];
      return sum / count;
    });

    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Average Rating',
              data: averageRatings,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 1,
              max: 5,
              ticks: {
                stepSize: 1,
              },
              title: {
                display: true,
                text: 'Rating',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
              ticks: {
                maxTicksLimit: 10, // Limit the number of x-axis labels to prevent overcrowding
                callback: function(val, index) {
                  // Only show some of the dates to avoid overcrowding
                  const label = this.getLabelForValue(val as number);
                  const date = new Date(label);
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }
              }
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const date = new Date(tooltipItems[0].label);
                  return date.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                },
                footer: (tooltipItems) => {
                  const dateStr = tooltipItems[0].label;
                  return `Reviews: ${reviewsByDate[dateStr].count}`;
                },
              },
            },
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Average Rating Over Time',
              font: {
                size: 16,
              },
            },
          },
        },
      });
    }
  }, [reviews]);

  return (
    <div className={`w-full h-64 ${className}`}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default RatingTrendChart; 