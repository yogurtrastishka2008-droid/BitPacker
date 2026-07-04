import React from 'react';
import type { SimulationConfig, NetworkProtocol } from '../types';
import { getProtocolOverheadBytes } from '../utils/simulation';
import { Activity, Users, Zap, Network, HelpCircle } from 'lucide-react';

interface SimulatorDashboardProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  packedSize: number;
  jsonSize: number;
  rawSize: number;
}

const PROTOCOLS: { value: NetworkProtocol; name: string; desc: string; bytes: number }[] = [
  { value: 'roblox', name: 'Roblox RemoteEvent', desc: 'Roblox custom reliable UDP channel wrapper + RemoteEvent meta.', bytes: 49 },
  { value: 'unity', name: 'Unity Netcode (NGO)', desc: 'Unity Netcode for GameObjects wrapper over Unity Transport (UTP).', bytes: 40 },
  { value: 'sbox', name: 's&box Netcode', desc: 's&box network event packaging over Steamworks Sockets.', bytes: 42 },
  { value: 'udp', name: 'Raw UDP (IPv4)', desc: 'Standard IPv4 header (20B) + UDP header (8B). No engine wrappers.', bytes: 28 },
  { value: 'tcp', name: 'Raw TCP (IPv4)', desc: 'Standard IPv4 header (20B) + TCP header (20B) without options.', bytes: 40 },
  { value: 'websocket', name: 'WebSocket (WS)', desc: 'IPv4 + TCP header + standard WebSocket frame framing mask (4B).', bytes: 44 }
];

export const SimulatorDashboard: React.FC<SimulatorDashboardProps> = ({
  config,
  onConfigChange,
  packedSize,
  jsonSize,
  rawSize
}) => {
  
  const handleSliderChange = (key: keyof SimulationConfig, value: number) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const handleProtocolChange = (protocol: NetworkProtocol) => {
    onConfigChange({
      ...config,
      protocol
    });
  };

  const currentOverhead = getProtocolOverheadBytes(config.protocol, config.customOverheadBytes);

  return (
    <div className="glass-card panel-simulator">
      <div className="panel-header">
        <Activity className="header-icon text-glow-cyan" />
        <h2>Bandwidth Simulator</h2>
      </div>

      <p className="panel-description">
        Tweak players, replication frequency, and protocol options to see how minor changes scale globally.
      </p>

      {/* Control Sliders */}
      <div className="simulator-controls">
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label-icon">
              <Users size={16} className="text-cyan" />
              <span>Player Count</span>
            </span>
            <span className="slider-value font-mono">{config.playerCount} Players</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={config.playerCount}
            onChange={(e) => handleSliderChange('playerCount', Number(e.target.value))}
            className="input-range"
          />
          <div className="slider-limits font-mono">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label-icon">
              <Zap size={16} className="text-amber" />
              <span>Server Tick Rate</span>
            </span>
            <span className="slider-value font-mono">{config.tickRate} Hz (Ticks/sec)</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={config.tickRate}
            onChange={(e) => handleSliderChange('tickRate', Number(e.target.value))}
            className="input-range"
          />
          <div className="slider-limits font-mono">
            <span>10 Hz</span>
            <span>120 Hz</span>
          </div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label-icon">
              <Network size={16} className="text-purple" />
              <span>Packets Per Tick</span>
            </span>
            <span className="slider-value font-mono">{config.packetsPerTick} / tick</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={config.packetsPerTick}
            onChange={(e) => handleSliderChange('packetsPerTick', Number(e.target.value))}
            className="input-range"
          />
          <div className="slider-limits font-mono">
            <span>1 per tick</span>
            <span>10 per tick</span>
          </div>
        </div>
      </div>

      {/* Protocol Select Grid */}
      <div className="protocol-selector-wrapper">
        <label className="section-title">Protocol Overhead Envelope</label>
        <div className="protocol-grid">
          {PROTOCOLS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`protocol-btn ${config.protocol === p.value ? 'active-protocol' : ''}`}
              onClick={() => handleProtocolChange(p.value)}
            >
              <div className="protocol-btn-name font-mono">{p.name}</div>
              <div className="protocol-btn-bytes">+{p.bytes}B overhead</div>
            </button>
          ))}
        </div>
        <div className="protocol-info-box font-sm">
          <HelpCircle size={14} className="info-icon" />
          <span>{PROTOCOLS.find(p => p.value === config.protocol)?.desc}</span>
        </div>
      </div>

      {/* Numerical Comparison table */}
      <div className="simulation-preview-table">
        <label className="section-title">Single Packet Composition</label>
        <div className="packet-composition-container font-mono text-sm">
          {/* BitPacked bar */}
          <div className="composition-row">
            <span className="comp-label">BitPacked</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload" style={{ width: `${Math.max(5, (packedSize / (jsonSize + currentOverhead)) * 100)}%` }} title={`Payload: ${packedSize}B`}>
                <span>{packedSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`Overhead: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{packedSize + currentOverhead} bytes</span>
            </div>
          </div>

          {/* Raw bar */}
          <div className="composition-row">
            <span className="comp-label">Raw Replica</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload bg-raw-payload" style={{ width: `${Math.max(5, (rawSize / (jsonSize + currentOverhead)) * 100)}%` }} title={`Payload: ${rawSize}B`}>
                <span>{rawSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`Overhead: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{rawSize + currentOverhead} bytes</span>
            </div>
          </div>

          {/* JSON bar */}
          <div className="composition-row">
            <span className="comp-label">JSON string</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload bg-json-payload" style={{ width: `${(jsonSize / (jsonSize + currentOverhead)) * 100}%` }} title={`Payload: ${jsonSize}B`}>
                <span>{jsonSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`Overhead: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{jsonSize + currentOverhead} bytes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
