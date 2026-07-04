import React, { useState } from 'react';
import type { PacketField } from '../types';
import { generateRobloxCode } from '../utils/generators/roblox';
import { generateSboxCode } from '../utils/generators/sbox';
import { generateUnityCode } from '../utils/generators/unity';
import { Code, Copy, Check, Terminal } from 'lucide-react';

interface CodeGeneratorProps {
  fields: PacketField[];
}

type TabName = 'roblox' | 'sbox' | 'unity';

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ fields }) => {
  const [activeTab, setActiveTab] = useState<TabName>('roblox');
  const [copied, setCopied] = useState(false);

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
        <h2>Generated Serialization Code</h2>
      </div>

      <p className="panel-description">
        Instantly compile your packet design into optimal code for your target game engine.
      </p>

      {/* Tabs */}
      <div className="codegen-tabs">
        <button
          className={`tab-btn ${activeTab === 'roblox' ? 'active-tab border-roblox' : ''}`}
          onClick={() => setActiveTab('roblox')}
          type="button"
        >
          Roblox (Luau)
        </button>
        <button
          className={`tab-btn ${activeTab === 'sbox' ? 'active-tab border-sbox' : ''}`}
          onClick={() => setActiveTab('sbox')}
          type="button"
        >
          s&box (C#)
        </button>
        <button
          className={`tab-btn ${activeTab === 'unity' ? 'active-tab border-unity' : ''}`}
          onClick={() => setActiveTab('unity')}
          type="button"
        >
          Unity (C#)
        </button>
      </div>

      {/* Code Viewer Console */}
      <div className="console-editor">
        <div className="console-header">
          <div className="console-info">
            <Terminal size={14} className="text-muted" />
            <span className="font-mono text-xs">{getLanguageLabel()} Serializer</span>
          </div>
          <button
            onClick={handleCopy}
            className={`btn-copy font-mono text-xs ${copied ? 'text-emerald' : ''}`}
            type="button"
          >
            {copied ? (
              <>
                <Check size={14} className="margin-r-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} className="margin-r-5" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <div className="console-body">
          {fields.length === 0 ? (
            <div className="empty-state font-mono text-sm">
              // Schema is empty. Define variables in the Packet Schema Designer to compile serialization code.
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
