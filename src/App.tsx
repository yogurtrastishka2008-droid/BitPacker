import { useState } from 'react';
import type { PacketField, SimulationConfig } from './types';
import { PacketEditor } from './components/PacketEditor';
import { BitVisualizer } from './components/BitVisualizer';
import { SimulatorDashboard } from './components/SimulatorDashboard';
import { BandwidthChart } from './components/BandwidthChart';
import { CodeGenerator } from './components/CodeGenerator';
import { estimateJsonSizeBytes, estimateRawSizeBytes, calculatePacketLayout } from './utils/bitPacking';
import { translations, type Language } from './utils/i18n';
import { Cpu, Terminal, Network, ShieldCheck, Globe } from 'lucide-react';

const INITIAL_FIELDS: PacketField[] = [
  { id: 'f-1', name: 'playerId', type: 'int', bitWidth: 8, minValue: 0, maxValue: 255 },
  { id: 'f-2', name: 'isGrounded', type: 'bool', bitWidth: 1 },
  { id: 'f-3', name: 'health', type: 'int', bitWidth: 7, minValue: 0, maxValue: 100 },
  { id: 'f-4', name: 'position', type: 'vector3', bitWidth: 33, vectorType: 'quantized', minValue: -100, maxValue: 100, vectorPrecision: 0.1 },
  { id: 'f-5', name: 'animState', type: 'int', bitWidth: 3, minValue: 0, maxValue: 7 }
];

const INITIAL_SIM_CONFIG: SimulationConfig = {
  playerCount: 32,
  tickRate: 30,
  packetsPerTick: 1,
  protocol: 'udp'
};

function App() {
  const [fields, setFields] = useState<PacketField[]>(INITIAL_FIELDS);
  const [simConfig, setSimConfig] = useState<SimulationConfig>(INITIAL_SIM_CONFIG);
  const [lang, setLang] = useState<Language>('ru');

  const t = translations[lang];
  const { totalBytes } = calculatePacketLayout(fields);
  const jsonBytes = estimateJsonSizeBytes(fields);
  const rawBytes = estimateRawSizeBytes(fields);

  return (
    <div className="app-shell">
      <div className="bg-glow bg-glow-blue"></div>
      <div className="bg-glow bg-glow-purple"></div>
      <div className="grid-overlay"></div>

      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <Cpu size={24} className="text-cyan animate-pulse" />
          </div>
          <div className="brand-titles">
            <h1>BitPacker</h1>
            <span className="brand-sub">{t.headerSubtitle}</span>
          </div>
        </div>
        
        <div className="header-actions-wrapper">
          <div className="lang-toggle-container">
            <Globe size={12} className="lang-icon" />
            <button 
              type="button" 
              className={`lang-btn ${lang === 'en' ? 'active-lang' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button 
              type="button" 
              className={`lang-btn ${lang === 'ru' ? 'active-lang' : ''}`}
              onClick={() => setLang('ru')}
            >
              RU
            </button>
          </div>

          <div className="header-status font-mono text-xs">
            <div className="status-item">
              <Network size={14} className="text-cyan" />
              <span>{t.targetPlatforms}</span>
            </div>
            <div className="status-item border-l padding-l-10 margin-l-10">
              <ShieldCheck size={14} className="text-emerald" />
              <span>{t.statusReady}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <div className="grid-col flex-col">
          <PacketEditor 
            fields={fields} 
            onFieldsChange={setFields} 
            lang={lang}
          />
          <CodeGenerator 
            fields={fields} 
            lang={lang}
          />
        </div>

        <div className="grid-col flex-col">
          <BitVisualizer 
            fields={fields} 
            lang={lang}
          />
          <div className="grid-row-responsive">
            <SimulatorDashboard
              config={simConfig}
              onConfigChange={setSimConfig}
              packedSize={totalBytes}
              jsonSize={jsonBytes}
              rawSize={rawBytes}
              lang={lang}
            />
            <BandwidthChart
              config={simConfig}
              packedSize={totalBytes}
              jsonSize={jsonBytes}
              rawSize={rawBytes}
              lang={lang}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <Terminal size={14} className="margin-r-5" />
            <span className="font-mono text-xs">{t.footerVersion}</span>
          </div>
          <div className="footer-right text-xs">
            <span>{t.footerText}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
