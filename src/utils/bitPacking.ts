import type { PacketField } from '../types';

/**
 * Calculates the exact bit width for a single field based on its configuration.
 */
export function getFieldBitWidth(field: PacketField): number {
  switch (field.type) {
    case 'bool':
      return 1;
      
    case 'int': {
      if (field.minValue !== undefined && field.maxValue !== undefined) {
        const range = field.maxValue - field.minValue;
        if (range <= 0) return 1;
        return Math.max(1, Math.ceil(Math.log2(range + 1)));
      }
      return Math.min(32, Math.max(1, field.bitWidth));
    }
      
    case 'float': {
      if (field.floatType === 'single') {
        return 32;
      } else if (field.floatType === 'half') {
        return 16;
      } else if (field.floatType === 'quantized' && field.minValue !== undefined && field.maxValue !== undefined && field.precision) {
        const range = field.maxValue - field.minValue;
        if (range <= 0 || field.precision <= 0) return 32;
        const steps = Math.ceil(range / field.precision);
        return Math.max(1, Math.ceil(Math.log2(steps + 1)));
      }
      return 32; // Default fallback
    }
      
    case 'vector3': {
      if (field.vectorType === 'quantized' && field.minValue !== undefined && field.maxValue !== undefined && field.vectorPrecision) {
        const range = field.maxValue - field.minValue;
        if (range <= 0 || field.vectorPrecision <= 0) return 96;
        const steps = Math.ceil(range / field.vectorPrecision);
        const componentBits = Math.max(1, Math.ceil(Math.log2(steps + 1)));
        return componentBits * 3; // 3 components (X, Y, Z)
      }
      // Full precision: 3 x 32-bit floats
      return 96;
    }
      
    case 'string': {
      const maxLen = field.maxStringLength || 32;
      const charBits = maxLen * 8; // 8 bits per ASCII character
      if (field.stringType === 'dynamic') {
        // Dynamic strings need a length prefix.
        // If max string length is < 256, use 8 bits. Else use 16 bits.
        const prefixBits = maxLen < 256 ? 8 : 16;
        return charBits + prefixBits;
      }
      return charBits; // Fixed length: exact width allocation
    }
    
    default:
      return 8;
  }
}

export interface FieldLayoutInfo extends PacketField {
  bitWidthCalculated: number;
  bitOffset: number;
  byteIndexStart: number;
  byteIndexEnd: number;
  bitOffsetInByteStart: number;
  bitOffsetInByteEnd: number;
}

/**
 * Maps out the sequence of fields into their precise bit alignments and offsets.
 */
export function calculatePacketLayout(fields: PacketField[]): {
  layoutFields: FieldLayoutInfo[];
  totalBits: number;
  totalBytes: number;
  paddingBits: number;
} {
  let currentOffset = 0;
  
  const layoutFields: FieldLayoutInfo[] = fields.map(field => {
    const bitWidth = getFieldBitWidth(field);
    
    // Check if we need to align to the next byte boundary
    const isMultiByte = bitWidth > 8 || field.type === 'vector3' || field.type === 'string' || (field.type === 'float' && field.floatType !== 'quantized');
    const crossesByteBoundary = (currentOffset % 8) + bitWidth > 8;
    
    if (isMultiByte || crossesByteBoundary) {
      if (currentOffset % 8 !== 0) {
        currentOffset = Math.ceil(currentOffset / 8) * 8;
      }
    }
    
    const offset = currentOffset;
    
    const byteIndexStart = Math.floor(offset / 8);
    const bitOffsetInByteStart = offset % 8;
    
    const endOffset = offset + bitWidth - 1;
    const byteIndexEnd = Math.floor(endOffset / 8);
    const bitOffsetInByteEnd = endOffset % 8;
    
    currentOffset += bitWidth;
    
    return {
      ...field,
      bitWidthCalculated: bitWidth,
      bitOffset: offset,
      byteIndexStart,
      byteIndexEnd,
      bitOffsetInByteStart,
      bitOffsetInByteEnd
    };
  });
  
  const totalBits = currentOffset;
  const totalBytes = Math.ceil(totalBits / 8);
  const paddingBits = totalBytes * 8 - totalBits;
  
  return {
    layoutFields,
    totalBits,
    totalBytes,
    paddingBits
  };
}

/**
 * Estimates the size of standard JSON serialization for the packet.
 */
export function estimateJsonSizeBytes(fields: PacketField[]): number {
  let estimatedBytes = 2; // Outer brackets '{}'
  
  fields.forEach((field, index) => {
    // Key overhead: '"key":' -> name.length + 3 bytes
    estimatedBytes += field.name.length + 3;
    
    // Value overhead
    switch (field.type) {
      case 'bool':
        estimatedBytes += 4.5; // Average length of 'true' / 'false'
        break;
      case 'int': {
        // Average digit size based on bounds or standard integer
        const maxVal = field.maxValue !== undefined ? Math.abs(field.maxValue) : 1000;
        const length = Math.max(1, Math.ceil(Math.log10(maxVal + 1)));
        const isNegative = field.minValue !== undefined && field.minValue < 0;
        estimatedBytes += length + (isNegative ? 1 : 0);
        break;
      }
      case 'float':
        estimatedBytes += 6.5; // E.g., '123.45' or '-1.234'
        break;
      case 'vector3':
        // JSON representation: '[x,y,z]' -> e.g. '[12.3,45.6,-7.8]'
        estimatedBytes += 22; // Brackets + numbers + commas average
        break;
      case 'string':
        // JSON representation: '"text"'
        estimatedBytes += (field.maxStringLength ? Math.round(field.maxStringLength * 0.6) : 10) + 2;
        break;
    }
    
    // Comma separator between JSON properties
    if (index < fields.length - 1) {
      estimatedBytes += 1;
    }
  });
  
  return Math.ceil(estimatedBytes);
}

/**
 * Estimates the size of standard raw network replication (no bitpacking or custom compression).
 */
export function estimateRawSizeBytes(fields: PacketField[]): number {
  let estimatedBytes = 0;
  
  fields.forEach(field => {
    switch (field.type) {
      case 'bool':
        estimatedBytes += 1; // 1 byte in standard engines
        break;
      case 'int':
        estimatedBytes += 4; // Standard 32-bit int
        break;
      case 'float':
        estimatedBytes += 4; // Standard 32-bit float
        break;
      case 'vector3':
        estimatedBytes += 12; // 3 x 32-bit float = 12 bytes
        break;
      case 'string':
        estimatedBytes += (field.maxStringLength || 32) + 2; // chars + 2 bytes length prefix
        break;
    }
  });
  
  return estimatedBytes;
}
