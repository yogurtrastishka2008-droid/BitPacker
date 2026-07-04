import React, { useState } from 'react';
import type { PacketField, FieldType, FloatType, VectorType, StringType } from '../types';
import { getFieldBitWidth } from '../utils/bitPacking';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2, Info } from 'lucide-react';

interface PacketEditorProps {
  fields: PacketField[];
  onFieldsChange: (fields: PacketField[]) => void;
}

const RESERVED_KEYWORDS = new Set([
  'end', 'repeat', 'until', 'class', 'struct', 'public', 'private', 'void', 'int', 'float',
  'bool', 'string', 'vector3', 'write', 'read', 'serialize', 'deserialize', 'packetsize',
  'networkpacket', 'buffer', 'self', 'local', 'function', 'return', 'then', 'if', 'else',
  'elseif', 'and', 'or', 'not', 'true', 'false', 'nil', 'null', 'using', 'namespace',
  'import', 'export', 'type', 'new', 'get', 'set', 'vector3.new', 'vector3.zero'
]);

export const PacketEditor: React.FC<PacketEditorProps> = ({ fields, onFieldsChange }) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('int');

  const addField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    // Check for duplicate names
    const cleanName = newFieldName.trim().replace(/\s+/g, '_');
    if (fields.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('A field with this name already exists.');
      return;
    }

    // Check for reserved keywords
    if (RESERVED_KEYWORDS.has(cleanName.toLowerCase())) {
      alert(`"${cleanName}" is a reserved programming keyword or serialization method. Please use another name.`);
      return;
    }

    const defaultFields: Record<FieldType, Partial<PacketField>> = {
      bool: { bitWidth: 1 },
      int: { bitWidth: 8, minValue: 0, maxValue: 255 },
      float: { bitWidth: 32, floatType: 'single' },
      vector3: { bitWidth: 96, vectorType: 'full' },
      string: { bitWidth: 128, stringType: 'dynamic', maxStringLength: 16 }
    };

    const newField: PacketField = {
      id: crypto.randomUUID(),
      name: cleanName,
      type: newFieldType,
      ...defaultFields[newFieldType]
    } as PacketField;

    onFieldsChange([...fields, newField]);
    setNewFieldName('');
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<PacketField>) => {
    onFieldsChange(
      fields.map(f => {
        if (f.id === id) {
          const updated = { ...f, ...updates } as PacketField;
          
          // Re-calculate derived values if needed
          if (updated.type === 'int' && updated.minValue !== undefined && updated.maxValue !== undefined) {
            updated.bitWidth = getFieldBitWidth(updated);
          } else if (updated.type === 'float' && updated.floatType === 'quantized' && updated.minValue !== undefined && updated.maxValue !== undefined && updated.precision) {
            updated.bitWidth = getFieldBitWidth(updated);
          } else if (updated.type === 'vector3' && updated.vectorType === 'quantized' && updated.minValue !== undefined && updated.maxValue !== undefined && updated.vectorPrecision) {
            updated.bitWidth = getFieldBitWidth(updated);
          } else if (updated.type === 'string' && updated.maxStringLength !== undefined) {
            updated.bitWidth = getFieldBitWidth(updated);
          }
          
          return updated;
        }
        return f;
      })
    );
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    
    onFieldsChange(newFields);
  };

  return (
    <div className="glass-card panel-editor">
      <div className="panel-header">
        <Settings2 className="header-icon text-glow-cyan" />
        <h2>Packet Schema Designer</h2>
      </div>
      
      <p className="panel-description">
        Define your network variables and specify their bit-level compression rules.
      </p>

      {/* Field Creator Form */}
      <form onSubmit={addField} className="field-creator-form">
        <div className="form-group flex-1">
          <input
            type="text"
            placeholder="Field Name (e.g. position, ammo)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="input-text"
            pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
            title="Names must start with a letter/underscore and contain only alphanumeric characters or underscores"
          />
        </div>
        <div className="form-group select-wrapper">
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
            className="input-select"
          >
            <option value="int">Integer (bits/range)</option>
            <option value="bool">Boolean (1 bit)</option>
            <option value="float">Float (IEEE/Quantized)</option>
            <option value="vector3">Vector3 (3D coords)</option>
            <option value="string">String (UTF-8)</option>
          </select>
        </div>
        <button type="submit" className="btn btn-add">
          <Plus size={18} />
          <span>Add</span>
        </button>
      </form>

      {/* Fields List */}
      <div className="fields-list">
        {fields.length === 0 ? (
          <div className="empty-state">
            <Info size={24} className="text-muted" />
            <p>No fields defined yet. Add your first field above to begin packing.</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const calculatedWidth = getFieldBitWidth(field);
            
            return (
              <div key={field.id} className={`field-row-card border-${field.type}`}>
                <div className="field-header-row">
                  <div className="field-info">
                    <span className={`badge badge-${field.type}`}>{field.type}</span>
                    <span className="field-title">{field.name}</span>
                  </div>
                  <div className="field-actions">
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="btn-icon"
                      title="Move Up"
                      type="button"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="btn-icon"
                      title="Move Down"
                      type="button"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="btn-icon btn-danger"
                      title="Remove Field"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="field-config-body">
                  {/* INTEGER CONFIG */}
                  {field.type === 'int' && (
                    <div className="config-grid">
                      <div className="config-item">
                        <label>Min Value</label>
                        <input
                          type="number"
                          value={field.minValue ?? ''}
                          onChange={(e) => updateField(field.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                          className="input-number"
                        />
                      </div>
                      <div className="config-item">
                        <label>Max Value</label>
                        <input
                          type="number"
                          value={field.maxValue ?? ''}
                          onChange={(e) => updateField(field.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                          className="input-number"
                        />
                      </div>
                      {field.minValue === undefined || field.maxValue === undefined ? (
                        <div className="config-item">
                          <label>Static Bit Width</label>
                          <input
                            type="number"
                            min="1"
                            max="32"
                            value={field.bitWidth}
                            onChange={(e) => updateField(field.id, { bitWidth: Math.min(32, Math.max(1, Number(e.target.value))) })}
                            className="input-number"
                          />
                        </div>
                      ) : (
                        <div className="config-item value-preview">
                          <label>Auto Bits</label>
                          <div className="preview-box font-mono">{calculatedWidth} bits</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FLOAT CONFIG */}
                  {field.type === 'float' && (
                    <div className="config-grid">
                      <div className="config-item">
                        <label>Encoding</label>
                        <select
                          value={field.floatType || 'single'}
                          onChange={(e) => updateField(field.id, { floatType: e.target.value as FloatType })}
                          className="input-select-compact"
                        >
                          <option value="single">Single Float (32-bit)</option>
                          <option value="half">Half Float (16-bit)</option>
                          <option value="quantized">Quantized Range</option>
                        </select>
                      </div>
                      {field.floatType === 'quantized' && (
                        <>
                          <div className="config-item">
                            <label>Min</label>
                            <input
                              type="number"
                              step="any"
                              value={field.minValue ?? ''}
                              onChange={(e) => updateField(field.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                            />
                          </div>
                          <div className="config-item">
                            <label>Max</label>
                            <input
                              type="number"
                              step="any"
                              value={field.maxValue ?? ''}
                              onChange={(e) => updateField(field.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                            />
                          </div>
                          <div className="config-item">
                            <label>Precision (Step)</label>
                            <input
                              type="number"
                              step="any"
                              min="0.000001"
                              value={field.precision ?? ''}
                              onChange={(e) => updateField(field.id, { precision: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                              placeholder="e.g. 0.01"
                            />
                          </div>
                        </>
                      )}
                      <div className="config-item value-preview">
                        <label>Size Allocation</label>
                        <div className="preview-box font-mono">{calculatedWidth} bits</div>
                      </div>
                    </div>
                  )}

                  {/* VECTOR3 CONFIG */}
                  {field.type === 'vector3' && (
                    <div className="config-grid">
                      <div className="config-item">
                        <label>Encoding</label>
                        <select
                          value={field.vectorType || 'full'}
                          onChange={(e) => updateField(field.id, { vectorType: e.target.value as VectorType })}
                          className="input-select-compact"
                        >
                          <option value="full">Full (96-bit)</option>
                          <option value="quantized">Quantized Bounds</option>
                        </select>
                      </div>
                      {field.vectorType === 'quantized' && (
                        <>
                          <div className="config-item">
                            <label>Min (XYZ Bound)</label>
                            <input
                              type="number"
                              step="any"
                              value={field.minValue ?? ''}
                              onChange={(e) => updateField(field.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                            />
                          </div>
                          <div className="config-item">
                            <label>Max (XYZ Bound)</label>
                            <input
                              type="number"
                              step="any"
                              value={field.maxValue ?? ''}
                              onChange={(e) => updateField(field.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                            />
                          </div>
                          <div className="config-item">
                            <label>Precision (Step)</label>
                            <input
                              type="number"
                              step="any"
                              min="0.000001"
                              value={field.vectorPrecision ?? ''}
                              onChange={(e) => updateField(field.id, { vectorPrecision: e.target.value ? Number(e.target.value) : undefined })}
                              className="input-number"
                              placeholder="e.g. 0.1"
                            />
                          </div>
                        </>
                      )}
                      <div className="config-item value-preview">
                        <label>Size Allocation</label>
                        <div className="preview-box font-mono">{calculatedWidth} bits</div>
                      </div>
                    </div>
                  )}

                  {/* STRING CONFIG */}
                  {field.type === 'string' && (
                    <div className="config-grid">
                      <div className="config-item">
                        <label>Length Type</label>
                        <select
                          value={field.stringType || 'dynamic'}
                          onChange={(e) => updateField(field.id, { stringType: e.target.value as StringType })}
                          className="input-select-compact"
                        >
                          <option value="dynamic">Dynamic (Header length)</option>
                          <option value="fixed">Fixed size</option>
                        </select>
                      </div>
                      <div className="config-item">
                        <label>Max Char Length</label>
                        <input
                          type="number"
                          min="1"
                          max="2048"
                          value={field.maxStringLength ?? 16}
                          onChange={(e) => updateField(field.id, { maxStringLength: Math.max(1, Number(e.target.value)) })}
                          className="input-number"
                        />
                      </div>
                      <div className="config-item value-preview">
                        <label>Size Allocation</label>
                        <div className="preview-box font-mono">{calculatedWidth} bits</div>
                      </div>
                    </div>
                  )}

                  {/* BOOLEAN CONFIG */}
                  {field.type === 'bool' && (
                    <div className="config-grid-bool">
                      <span className="text-muted text-sm">Booleans are packed as a single bit (1/8th of a byte) alongside adjacent variables.</span>
                      <div className="config-item value-preview text-right">
                        <label>Size Allocation</label>
                        <div className="preview-box font-mono inline-block">1 bit</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
