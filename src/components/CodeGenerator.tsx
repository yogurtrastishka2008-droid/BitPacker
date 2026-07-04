import React, { useState } from 'react';
import type { PacketField } from '../types';
import { generateRobloxCode } from '../utils/generators/roblox';
import { generateSboxCode } from '../utils/generators/sbox';
import { generateUnityCode } from '../utils/generators/unity';
import { translations, type Language } from '../utils/i18n';
import { Code, Copy, Check, Terminal } from 'lucide-react';

interface CodeGeneratorProps {
  fields: PacketField[];
  lang: Language;
}

type TabName = 'roblox' | 'sbox' | 'unity';

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ fields, lang }) => {
  const [activeTab, setActiveTab] = useState<TabName>('roblox');
  const [copied, setCopied] = useState(false);

  const t = translations[lang];

  const getGeneratedCode = () => {
    switch (activeTab) {
      case 'roblox':
        return generateRobloxCode(fields);
      case 'sbox':
        return generateSboxCode(fields);
      case 'unity':
        return generateUnityCode(fields);
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = () => {
    switch (activeTab) {
      case 'roblox':
        return 'Luau (Roblox)';
      case 'sbox':
        return 'C# (s&box)';
      case 'unity':
        return 'C# (Unity NGO)';
    }
  };

  return (
    <div className="glass-card panel-codegen">
      <div className="panel-header">
        <Code className="header-icon text-glow-purple" />
        <h2>{t.codegenTitle}</h2>
      </div>

      <p className="panel-description">
        {t.codegenDesc}
      </p>

      {/* Tabs */}
      <div className="codegen-tabs">
        <button
          className={`tab-btn ${activeTab === 'roblox' ? 'active-tab border-roblox' : ''}`}
          onClick={() => setActiveTab('roblox')}
          type="button"
        >
          {t.tabRoblox}
        </button>
        <button
          className={`tab-btn ${activeTab === 'sbox' ? 'active-tab border-sbox' : ''}`}
          onClick={() => setActiveTab('sbox')}
          type="button"
        >
          {t.tabSbox}
        </button>
        <button
          className={`tab-btn ${activeTab === 'unity' ? 'active-tab border-unity' : ''}`}
          onClick={() => setActiveTab('unity')}
          type="button"
        >
          {t.tabUnity}
        </button>
      </div>

      {/* Code Viewer Console */}
      <div className="console-editor">
        <div className="console-header">
          <div className="console-info">
            <Terminal size={14} className="text-muted" />
            <span className="font-mono text-xs">{getLanguageLabel()} {lang === 'ru' ? 'Сериализатор' : 'Serializer'}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`btn-copy font-mono text-xs ${copied ? 'text-emerald' : ''}`}
            type="button"
          >
            {copied ? (
              <>
                <Check size={14} className="margin-r-5" />
                {t.copiedBtn}
              </>
            ) : (
              <>
                <Copy size={14} className="margin-r-5" />
                {t.copyBtn}
              </>
            )}
          </button>
        </div>
        <div className="console-body">
          {fields.length === 0 ? (
            <div className="empty-state font-mono text-sm">
              {lang === 'ru' 
                ? '// Схема пуста. Добавьте переменные в Конструкторе Сетевого Пакета для генерации кода.'
                : '// Schema is empty. Define variables in the Packet Schema Designer to compile serialization code.'
              }
            </div>
          ) : (
            <pre className="code-block font-mono text-sm">
              <code>{getGeneratedCode()}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
