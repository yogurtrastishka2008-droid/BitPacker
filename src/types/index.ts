export type FieldType = 'bool' | 'int' | 'float' | 'vector3' | 'string';

export type FloatType = 'half' | 'single' | 'quantized';
export type VectorType = 'full' | 'quantized';
export type StringType = 'fixed' | 'dynamic';

export interface PacketField {
  id: string;
  name: string;
  type: FieldType;
  
  // Integer settings
  bitWidth: number;          // 1 to 32 bits
  minValue?: number;         // Optional bounds checking or offset packing
  maxValue?: number;
  
  // Float settings
  floatType?: FloatType;
  precision?: number;        // Quantization step size (e.g. 0.01)
  
  // Vector settings
  vectorType?: VectorType;
  vectorPrecision?: number;  // Quantization step size for vector components (e.g. 0.1)
  
  // String settings
  stringType?: StringType;
  maxStringLength?: number;  // Maximum characters allowed
}

export type NetworkProtocol = 'roblox' | 'sbox' | 'unity' | 'udp' | 'tcp' | 'websocket';

export interface SimulationConfig {
  playerCount: number;       // 1 to 100 players
  tickRate: number;          // updates per second (e.g. 20, 60, 100)
  packetsPerTick: number;    // packet frequency per player per tick
  protocol: NetworkProtocol;
  customOverheadBytes?: number;
}

export interface ComparisonMetrics {
  bitPackedBytes: number;
  jsonBytes: number;
  rawBytes: number;
  
  bitPackedKbps: number;
  jsonKbps: number;
  rawKbps: number;
  
  bitPackedMbHour: number;
  jsonMbHour: number;
  rawMbHour: number;
  
  overheadBytes: number;
  payloadBytes: number;
}
