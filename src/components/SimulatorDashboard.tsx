import React from 'react';
import type { SimulationConfig, NetworkProtocol } from '../types';
import { getProtocolOverheadBytes } from '../utils/simulation';
import { translations, type Language } from '../utils/i18n';
import { Activity, Users, Zap, Network, HelpCircle } from 'lucide-react';

interface SimulatorDashboardProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  packedSize: number;
  jsonSize: number;
  rawSize: number;
  lang: Language;
}

const getProtocols = (lang: Language) => [
  { 
    value: 'roblox' as NetworkProtocol, 
    name: 'Roblox RemoteEvent', 
    desc: lang === 'ru' ? 'Надежный канал Luau + метаданные вызова RemoteEvent.' : 'Roblox custom reliable UDP channel wrapper + RemoteEvent meta.', 
    bytes: 49 
  },
  { 
    value: 'unity' as NetworkProtocol, 
    name: 'Unity Netcode (NGO)', 
    desc: lang === 'ru' ? 'Накладные расходы NGO поверх транспорта Unity Transport (UTP).' : 'Unity Netcode for GameObjects wrapper over Unity Transport (UTP).', 
    bytes: 40 
  },
  { 
    value: 'sbox' as NetworkProtocol, 
    name: 's&box Netcode', 
    desc: lang === 'ru' ? 'Упаковка сетевых ивентов s&box поверх Steamworks Sockets.' : 's&box network event packaging over Steamworks Sockets.', 
    bytes: 42 
  },
  { 
    value: 'udp' as NetworkProtocol, 
    name: 'Raw UDP (IPv4)', 
    desc: lang === 'ru' ? 'Стандартный заголовок IPv4 (20Б) + UDP (8Б). Без игрового движка.' : 'Standard IPv4 header (20B) + UDP header (8B). No engine wrappers.', 
    bytes: 28 
  },
  { 
    value: 'tcp' as NetworkProtocol, 
    name: 'Raw TCP (IPv4)', 
    desc: lang === 'ru' ? 'Стандартный заголовок IPv4 (20Б) + TCP (20Б) без опций.' : 'Standard IPv4 header (20B) + TCP header (20B) without options.', 
    bytes: 40 
  },
  { 
    value: 'websocket' as NetworkProtocol, 
    name: 'WebSocket (WS)', 
    desc: lang === 'ru' ? 'IPv4 + TCP + фреймирование WebSocket с маской (4Б).' : 'IPv4 + TCP header + standard WebSocket frame framing mask (4B).', 
    bytes: 44 
  }
];

export const SimulatorDashboard: React.FC<SimulatorDashboardProps> = ({
  config,
  onConfigChange,
  packedSize,
  jsonSize,
  rawSize,
  lang
}) => {
  const t = translations[lang];
  const protocols = getProtocols(lang);

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
        <h2>{t.simTitle}</h2>
      </div>

      <p className="panel-description">
        {t.simDesc}
      </p>

      {/* Control Sliders */}
      <div className="simulator-controls">
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label-icon">
              <Users size={16} className="text-cyan" />
              <span>{t.playerCount}</span>
            </span>
            <span className="slider-value font-mono">
              {config.playerCount} {lang === 'ru' ? 'Игроков' : 'Players'}
            </span>
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
              <span>{t.tickRate}</span>
            </span>
            <span className="slider-value font-mono">{config.tickRate} {t.ticksSec}</span>
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
              <span>{t.packetsPerTick}</span>
            </span>
            <span className="slider-value font-mono">{config.packetsPerTick} {t.perTick}</span>
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
            <span>1 {lang === 'ru' ? 'за тик' : 'per tick'}</span>
            <span>10 {lang === 'ru' ? 'за тик' : 'per tick'}</span>
          </div>
        </div>
      </div>

      {/* Protocol Select Grid */}
      <div className="protocol-selector-wrapper">
        <label className="section-title">{t.protocolEnvelope}</label>
        <div className="protocol-grid">
          {protocols.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`protocol-btn ${config.protocol === p.value ? 'active-protocol' : ''}`}
              onClick={() => handleProtocolChange(p.value)}
            >
              <div className="protocol-btn-name font-mono">{p.name}</div>
              <div className="protocol-btn-bytes">
                +{p.bytes}B {lang === 'ru' ? 'расходы' : 'overhead'}
              </div>
            </button>
          ))}
        </div>
        <div className="protocol-info-box font-sm">
          <HelpCircle size={14} className="info-icon" />
          <span>{protocols.find(p => p.value === config.protocol)?.desc}</span>
        </div>
      </div>

      {/* Numerical Comparison table */}
      <div className="simulation-preview-table">
        <label className="section-title">{t.singlePacketComp}</label>
        <div className="packet-composition-container font-mono text-sm">
          {/* BitPacked bar */}
          <div className="composition-row">
            <span className="comp-label">BitPacked</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload" style={{ width: `${Math.max(5, (packedSize / (jsonSize + currentOverhead)) * 100)}%` }} title={`${t.payload}: ${packedSize}B`}>
                <span>{packedSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`${lang === 'ru' ? 'Оверхед' : 'Overhead'}: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{packedSize + currentOverhead} {lang === 'ru' ? 'байт' : 'bytes'}</span>
            </div>
          </div>

          {/* Raw bar */}
          <div className="composition-row">
            <span className="comp-label">{lang === 'ru' ? 'Реплика Raw' : 'Raw Replica'}</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload bg-raw-payload" style={{ width: `${Math.max(5, (rawSize / (jsonSize + currentOverhead)) * 100)}%` }} title={`${t.payload}: ${rawSize}B`}>
                <span>{rawSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`${lang === 'ru' ? 'Оверхед' : 'Overhead'}: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{rawSize + currentOverhead} {lang === 'ru' ? 'байт' : 'bytes'}</span>
            </div>
          </div>

          {/* JSON bar */}
          <div className="composition-row">
            <span className="comp-label">{lang === 'ru' ? 'Строка JSON' : 'JSON string'}</span>
            <div className="comp-bar-wrapper">
              <div className="comp-bar-payload bg-json-payload" style={{ width: `${(jsonSize / (jsonSize + currentOverhead)) * 100}%` }} title={`${t.payload}: ${jsonSize}B`}>
                <span>{jsonSize}B</span>
              </div>
              <div className="comp-bar-overhead" style={{ width: `${(currentOverhead / (jsonSize + currentOverhead)) * 100}%` }} title={`${lang === 'ru' ? 'Оверхед' : 'Overhead'}: ${currentOverhead}B`}>
                <span>+{currentOverhead}B</span>
              </div>
              <span className="comp-total">{jsonSize + currentOverhead} {lang === 'ru' ? 'байт' : 'bytes'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
