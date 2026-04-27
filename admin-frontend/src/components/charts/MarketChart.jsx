import React, { useState, useMemo } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const TIME_RANGES = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '1D', hours: 24 },
  { label: '1W', hours: 24 * 7 },
  { label: '1M', hours: 24 * 30 },
  { label: 'ALL', hours: null },
];

const MarketChart = ({ data, currentProbability, title, className, closeDateTime, yesLabel, noLabel }) => {
  const [showInverseProbability, setShowInverseProbability] = useState(false);
  const [selectedRange, setSelectedRange] = useState('ALL');

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const range = TIME_RANGES.find(r => r.label === selectedRange);
    if (!range || !range.hours) return data;

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - range.hours);
    return data.filter(item => new Date(item.timestamp) >= cutoff);
  }, [data, selectedRange]);

  const generateDataPoints = (chartData, isInverse = false) => {
    let dataPoints = [];
    const now = new Date();
    const closeDate = closeDateTime ? new Date(closeDateTime) : null;
    const isMarketClosed = closeDate && closeDate < now;

    if (chartData && Array.isArray(chartData)) {
      const filtered = isMarketClosed
        ? chartData.filter(item => new Date(item.timestamp) <= closeDate)
        : chartData;

      dataPoints = filtered.map((item) => ({
        x: new Date(item.timestamp),
        y: (isInverse ? 1 - item.probability : item.probability) * 100,
      }));
    }

    if (currentProbability !== undefined && currentProbability !== null && !isMarketClosed) {
      dataPoints.push({
        x: now,
        y: (isInverse ? 1 - currentProbability : currentProbability) * 100,
      });
    }

    return dataPoints;
  };

  const generateChartData = () => {
    const chartData = [
      {
        type: 'stepArea',
        name: yesLabel || 'YES',
        showInLegend: false,
        color: showInverseProbability ? '#34d399' : '#34d399',
        fillOpacity: 0.15,
        lineThickness: 2,
        markerSize: 0,
        dataPoints: generateDataPoints(filteredData, false),
      },
    ];

    if (showInverseProbability) {
      chartData.push({
        type: 'stepArea',
        name: noLabel || 'NO',
        showInLegend: false,
        color: '#f87171',
        fillOpacity: 0.1,
        lineThickness: 2,
        markerSize: 0,
        dataPoints: generateDataPoints(filteredData, true),
      });
    }

    return chartData;
  };

  // Determine time format based on range
  const getAxisFormat = () => {
    switch (selectedRange) {
      case '1H':
      case '6H':
        return 'HH:mm';
      case '1D':
        return 'HH:mm';
      case '1W':
        return 'MMM DD';
      case '1M':
        return 'MMM DD';
      default:
        return 'MMM DD';
    }
  };

  const options = {
    animationEnabled: true,
    animationDuration: 300,
    backgroundColor: 'transparent',
    zoomEnabled: false,
    height: 280,
    toolTip: {
      backgroundColor: '#1a1f1e',
      borderColor: '#333',
      fontColor: '#fff',
      fontSize: 12,
      cornerRadius: 0,
      contentFormatter: function(e) {
        const date = e.entries[0].dataPoint.x;
        const val = e.entries[0].dataPoint.y;
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        return `<span style="font-size:11px;color:#999">${formattedDate}</span><br/><strong style="color:#34d399;font-size:14px">${yesLabel || 'Yes'} ${val.toFixed(0)}%</strong>`;
      }
    },
    axisX: {
      valueFormatString: getAxisFormat(),
      labelFontColor: '#555',
      labelFontSize: 11,
      labelFontFamily: 'Satoshi, sans-serif',
      lineColor: 'rgba(255,255,255,0.05)',
      gridColor: 'rgba(255,255,255,0.03)',
      tickColor: 'transparent',
    },
    axisY: {
      includeZero: false,
      minimum: 0,
      maximum: 100,
      interval: 10,
      labelFontColor: '#555',
      labelFontSize: 11,
      labelFontFamily: 'Satoshi, sans-serif',
      suffix: '%',
      lineColor: 'transparent',
      gridColor: 'rgba(255,255,255,0.05)',
      tickColor: 'transparent',
    },
    data: generateChartData(),
  };

  return (
    <div className={`${className} overflow-hidden`}>
      <div className="p-4">
        <CanvasJSChart options={options} />
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Time Range Selectors */}
        <div className="flex gap-1">
          {TIME_RANGES.map(range => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(range.label)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedRange === range.label
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInverseProbability(!showInverseProbability)}
            className={`p-1.5 transition-all ${
              showInverseProbability
                ? 'text-red-400 bg-red-500/10'
                : 'text-white/30 hover:text-white/50'
            }`}
            title={showInverseProbability ? `Hide ${noLabel} probability` : `Show ${noLabel} probability`}
          >
            <span className='material-symbols-outlined text-sm'>compare_arrows</span>
          </button>
          <button className='p-1.5 text-white/30 hover:text-white/50 transition-all' title='Chart settings'>
            <span className='material-symbols-outlined text-sm'>settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketChart;
