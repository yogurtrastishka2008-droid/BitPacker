import React, { useState } from 'react';
import type { PacketField } from '../types';
import { calculatePacketLayout } from '../utils/bitPacking';
import type { FieldLayoutInfo } from '../utils/bitPacking';
import { translations, type Language } from '../utils/i18n';
import { Eye, ShieldAlert, Info } from 'lucide-react';

interface BitVisualizerProps {
  fields: PacketField[];
  lang: Language;
}

// Curated modern neon color palette for fields
const FIELD_COLORS = [
  'var(--cyan-glow)',
  'var(--emerald-glow)',
  'var(--amber-glow)',
  'var(--purple-glow)',
  'var(--rose-glow)',
  'var(--blue-glow)',
  'var(--lime-glow)',
  'var(--orange-glow)'
];

export const BitVisualizer: React.FC<BitVisualizerProps> = ({ fields, lang }) => {
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [hoveredBitInfo, setHoveredBitInfo] = useState<{
    byteIndex: number;
    bitIndex: number;
    globalBitIndex: number;
    fieldName: string;
    fieldType: string;
  } | null>(null);

  const t = translations[lang];
  const { layoutFields, totalBits, totalBytes, paddingBits } = calculatePacketLayout(fields);

  // Map each global bit index (0 to totalBytes*8 - 1) to its field layout info
  const bitMap: (FieldLayoutInfo | null)[] = Array(totalBytes * 8).fill(null);
  
  layoutFields.forEach(lf => {
    for (let i = 0; i < lf.bitWidthCalculated; i++) {
      const globalBitIndex = lf.bitOffset + i;
      if (globalBitIndex < bitMap.length) {
        bitMap[globalBitIndex] = lf;
      }
    }
  });

  // Calculate efficiency
  const efficiency = totalBytes > 0 ? ((totalBits / (totalBytes * 8)) * 100).toFixed(1) : '100';

  return (
    <div className="glass-card panel-visualizer">
      <div className="panel-header">
        <Eye className="header-icon text-glow-emerald" />
        <h2>{t.visualizerTitle}</h2>
      </div>

      <p className="panel-description">
        {t.visualizerDesc}
      </p>

      {/* Metrics Row */}
      <div className="visualizer-stats">
        <div className="stat-card">
          <span className="stat-label">{t.totalSize}</span>
          <span className="stat-value font-mono text-glow-cyan">{totalBytes} <span className="stat-unit">{lang === 'ru' ? 'Байт' : 'Bytes'}</span></span>
          <span className="stat-desc font-mono">{totalBits} {lang === 'ru' ? 'бит' : 'bits'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t.padding} / {lang === 'ru' ? 'Пустота' : 'Waste'}</span>
          <span className={`stat-value font-mono ${paddingBits > 0 ? 'text-amber' : 'text-emerald'}`}>
            {paddingBits} <span className="stat-unit">{lang === 'ru' ? 'бит' : 'bits'}</span>
          </span>
          <span className="stat-desc font-mono">
            {paddingBits > 0 
              ? `${(paddingBits / 8).toFixed(2)} ${lang === 'ru' ? 'байт' : 'bytes'}` 
              : (lang === 'ru' ? 'Идеальное выравнивание' : 'Perfect alignment')
            }
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t.efficiency}</span>
          <span className="stat-value font-mono text-glow-emerald">{efficiency}%</span>
          <span className="stat-desc">
            {lang === 'ru' ? 'Полезных бит к выделенным' : 'Bits utilized vs allocated'}
          </span>
        </div>
      </div>

      {/* Interactive Bytes Grid */}
      <div className="bytes-grid-wrapper">
        {totalBytes === 0 ? (
          <div className="empty-state min-h-200">
            <p>{lang === 'ru' ? 'Добавьте поля схемы для визуализации структуры битового потока.' : 'Add schema fields to visualize the bit stream layout.'}</p>
          </div>
        ) : (
          <div className="bytes-grid">
            {Array.from({ length: totalBytes }).map((_, byteIdx) => {
              const startBit = byteIdx * 8;
              
              return (
                <div key={byteIdx} className="byte-block">
                  <div className="byte-label">
                    <span>{lang === 'ru' ? `Байт ${byteIdx}` : `Byte ${byteIdx}`}</span>
                    <span className="byte-range-label">{lang === 'ru' ? `Биты ${startBit + 7}-${startBit}` : `Bits ${startBit + 7}-${startBit}`}</span>
                  </div>
                  <div className="bits-row">
                    {/* Render bits from MSB to LSB (left to right: bit 7 down to bit 0 of the byte) */}
                    {Array.from({ length: 8 }).map((_, bitIdxInByte) => {
                      const bitIdxFromMsb = 7 - bitIdxInByte;
                      const globalBitIdx = startBit + bitIdxFromMsb;
                      const isPadding = globalBitIdx >= totalBits;
                      const matchingField = bitMap[globalBitIdx];
                      const fieldIndex = matchingField 
                         ? layoutFields.findIndex(f => f.id === matchingField.id) 
                         : -1;
                      
                      const color = !isPadding && fieldIndex !== -1 
                        ? FIELD_COLORS[fieldIndex % FIELD_COLORS.length] 
                        : 'transparent';

                      const isFieldHovered = matchingField && hoveredFieldId === matchingField.id;

                      return (
                        <div
                          key={bitIdxInByte}
                          className={`bit-box ${isPadding ? 'bit-padding' : ''} ${isFieldHovered ? 'bit-active-hover' : ''}`}
                          style={{
                            backgroundColor: color,
                            boxShadow: isFieldHovered ? `0 0 12px ${color}` : undefined
                          }}
                          onMouseEnter={() => {
                            if (matchingField) {
                              setHoveredFieldId(matchingField.id);
                              setHoveredBitInfo({
                                byteIndex: byteIdx,
                                bitIndex: bitIdxFromMsb,
                                globalBitIndex: globalBitIdx,
                                fieldName: matchingField.name,
                                fieldType: matchingField.type
                              });
                            } else if (isPadding) {
                              setHoveredBitInfo({
                                byteIndex: byteIdx,
                                bitIndex: bitIdxFromMsb,
                                globalBitIndex: globalBitIdx,
                                fieldName: lang === 'ru' ? 'Выравнивание' : 'Padding',
                                fieldType: 'waste'
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredFieldId(null);
                            setHoveredBitInfo(null);
                          }}
                        >
                          <span className="bit-index-num">{bitIdxFromMsb}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tooltip / Status Display */}
      <div className="tooltip-panel font-mono">
        {hoveredBitInfo ? (
          <div className="tooltip-content anim-fade-in">
            <span className="tooltip-bit-details">
              {lang === 'ru' 
                ? `Байт ${hoveredBitInfo.byteIndex}, Бит ${hoveredBitInfo.bitIndex} (Глобальный бит ${hoveredBitInfo.globalBitIndex})`
                : `Byte ${hoveredBitInfo.byteIndex}, Bit ${hoveredBitInfo.bitIndex} (Global Bit ${hoveredBitInfo.globalBitIndex})`
              }
            </span>
            <span className="tooltip-divider">|</span>
            <span className="tooltip-field-details">
              {lang === 'ru' ? 'Поле: ' : 'Field: '}
              <strong className={`text-${hoveredBitInfo.fieldType}`}>{hoveredBitInfo.fieldName}</strong> ({hoveredBitInfo.fieldType})
            </span>
          </div>
        ) : (
          <div className="tooltip-content text-muted">
            <Info size={14} className="margin-r-5" />
            {lang === 'ru' 
              ? 'Наведите курсор на биты, чтобы просмотреть их свойства и смещения.'
              : 'Hover over bits to inspect properties and offsets.'
            }
          </div>
        )}
      </div>

      {/* Alignment warnings */}
      {paddingBits > 0 && (
        <div className="alert-box alert-warning font-sm">
          <ShieldAlert size={16} className="alert-icon" />
          <div className="alert-text">
            <strong>{lang === 'ru' ? 'Неиспользуемое пространство пакета:' : 'Byte Boundary Padding:'}</strong>{' '}
            {lang === 'ru' 
              ? `В конце пакета осталось ${paddingBits} неиспользуемых бит. Добавление bool-переменных или квантование чисел поможет занять это место без увеличения размера сетевого кадра!`
              : `You have ${paddingBits} unused padding bits at the end of the packet. Adding a boolean or fitting other values can utilize this space with zero extra bandwidth cost!`
            }
          </div>
        </div>
      )}
    </div>
  );
};
