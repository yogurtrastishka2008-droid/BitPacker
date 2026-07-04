import React from 'react';
import type { SimulationConfig } from '../types';
import { runBandwidthSimulation } from '../utils/simulation';
import type { Language } from '../utils/i18n';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface BandwidthChartProps {
  config: SimulationConfig;
  packedSize: number;
  jsonSize: number;
  rawSize: number;
  lang: Language;
}

export const BandwidthChart: React.FC<BandwidthChartProps> = ({
  config,
  packedSize,
  jsonSize,
  rawSize,
  lang
}) => {
  // We will simulate bandwidth from 2 to 100 players to draw the trend line
  const playerSteps = [2, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  // Calculate simulation data for all steps
  const chartData = playerSteps.map(p => {
    const stepConfig = { ...config, playerCount: p };
    const sim = runBandwidthSimulation(packedSize, jsonSize, rawSize, stepConfig);
    return {
      players: p,
      bitPacked: sim.serverEgress.bitPackedKbps,
      json: sim.serverEgress.jsonKbps,
      raw: sim.serverEgress.rawKbps
    };
  });

  // Find max value to scale the Y-axis
  const maxKbps = Math.max(...chartData.map(d => d.json), 100);

  // SVG parameters
  const svgWidth = 600;
  const svgHeight = 250;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Scale functions
  const getX = (players: number) => {
    return paddingLeft + ((players - 2) / (100 - 2)) * chartWidth;
  };

  const getY = (kbps: number) => {
    return paddingTop + chartHeight - (kbps / maxKbps) * chartHeight;
  };

  // Build SVG Path strings
  const getPathD = (key: 'bitPacked' | 'json' | 'raw') => {
    return chartData.reduce((path, d, idx) => {
      const x = getX(d.players);
      const y = getY(d[key]);
      return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  };

  const pathBitPacked = getPathD('bitPacked');
  const pathJson = getPathD('json');
  const pathRaw = getPathD('raw');

  // Metrics for the CURRENT config
  const currentSim = runBandwidthSimulation(packedSize, jsonSize, rawSize, config);
  const currentBitPacked = currentSim.serverEgress.bitPackedKbps;
  const currentJson = currentSim.serverEgress.jsonKbps;
  const currentRaw = currentSim.serverEgress.rawKbps;

  const currentX = getX(config.playerCount);

  // Savings percentage
  const savedPercent = currentJson > 0 
    ? ((1 - currentBitPacked / currentJson) * 100).toFixed(0) 
    : '0';

  // Format bandwidth numbers nicely
  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(2)} Mbps`;
    }
    return `${kbps.toFixed(1)} Kbps`;
  };

  return (
    <div className="glass-card panel-chart">
      <div className="panel-header">
        <TrendingUp className="header-icon text-glow-cyan" />
        <h2>{lang === 'ru' ? 'Исходящий трафик сервера (O(N²))' : 'Server Egress Scaling (O(N²))'}</h2>
      </div>

      <p className="panel-description">
        {lang === 'ru' 
          ? 'Исходящий трафик сервера растет квадратично. Посмотрите, как упаковка бит спасает сеть от перегрузок.'
          : 'Server upload bandwidth grows quadratically in games. See how optimized bitpacking stops netcode from bottlenecking.'
        }
      </p>

      {/* Savings badge */}
      <div className="savings-badge-container anim-fade-in">
        <span className="savings-title">{lang === 'ru' ? 'Экономия трафика:' : 'BitPacker Savings:'}</span>
        <span className="savings-percentage text-glow-emerald">-{savedPercent}%</span>
        <span className="savings-sub font-mono">
          ({formatBandwidth(currentJson)} {lang === 'ru' ? 'против' : 'vs'} {formatBandwidth(currentBitPacked)})
        </span>
      </div>

      {/* Chart SVG */}
      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="svg-element">
          <defs>
            {/* Glow Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Gridlines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const yVal = (maxKbps / 4) * i;
            const y = getY(yVal);
            return (
              <g key={i} className="chart-gridline">
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} />
                <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="chart-text font-mono">
                  {formatBandwidth(yVal)}
                </text>
              </g>
            );
          })}

          {/* X Axis ticks */}
          {[2, 20, 40, 60, 80, 100].map((players, i) => {
            const x = getX(players);
            return (
              <g key={i} className="chart-gridline">
                <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + chartHeight} strokeDasharray="3 3" />
                <text x={x} y={paddingTop + chartHeight + 20} textAnchor="middle" className="chart-text font-mono">
                  {players}P
                </text>
              </g>
            );
          })}

          {/* Paths */}
          {/* JSON path (Rose/Red) */}
          <path d={pathJson} fill="none" stroke="var(--rose-glow)" strokeWidth="3" filter="url(#glow-rose)" className="chart-path" />
          
          {/* Raw path (Amber) */}
          <path d={pathRaw} fill="none" stroke="var(--amber-glow)" strokeWidth="2.5" className="chart-path" />
          
          {/* BitPacked path (Cyan/Green) */}
          <path d={pathBitPacked} fill="none" stroke="var(--cyan-glow)" strokeWidth="3.5" filter="url(#glow-cyan)" className="chart-path" />

          {/* Current playhead (vertical line tracking current player count) */}
          <line
            x1={currentX}
            y1={paddingTop}
            x2={currentX}
            y2={paddingTop + chartHeight}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Dots tracking current player count */}
          {/* JSON dot */}
          <circle cx={currentX} cy={getY(currentJson)} r="6" fill="var(--rose-glow)" />
          
          {/* Raw dot */}
          <circle cx={currentX} cy={getY(currentRaw)} r="5.5" fill="var(--amber-glow)" />

          {/* BitPacked dot */}
          <circle cx={currentX} cy={getY(currentBitPacked)} r="7" fill="var(--cyan-glow)" stroke="#090d16" strokeWidth="2" />
        </svg>
      </div>

      {/* Legend & warnings */}
      <div className="chart-legend-container font-mono text-sm">
        <div className="legend-item">
          <span className="legend-dot bg-cyan"></span>
          <span>{lang === 'ru' ? 'Сжатый пакет (BitPacked):' : 'BitPacked:'} <strong>{formatBandwidth(currentBitPacked)}</strong></span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-amber"></span>
          <span>{lang === 'ru' ? 'Обычная репликация:' : 'Raw Replication:'} <strong>{formatBandwidth(currentRaw)}</strong></span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-rose"></span>
          <span>{lang === 'ru' ? 'Строка JSON:' : 'JSON String:'} <strong>{formatBandwidth(currentJson)}</strong></span>
        </div>
      </div>

      {currentJson > 50000 && (
        <div className="alert-box alert-danger font-sm margin-t-10">
          <AlertTriangle size={16} className="alert-icon" />
          <div className="alert-text">
            <strong>{lang === 'ru' ? 'Внимание, сетевая перегрузка:' : 'Network Congestion Warning:'}</strong>{' '}
            {lang === 'ru' 
              ? 'При репликации в JSON исходящий трафик превышает 50 Мбит/с. Это перегрузит каналы игроков и вызовет серьезные лаги/потери пакетов.'
              : 'Under JSON replication, server output exceeds 50 Mbps. This will bottleneck client connections and cause severe latency jitter or packet drop.'
            }
          </div>
        </div>
      )}
    </div>
  );
};
