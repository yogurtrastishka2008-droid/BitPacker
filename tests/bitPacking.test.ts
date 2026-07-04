import { describe, it, expect } from 'vitest';
import { getFieldBitWidth, calculatePacketLayout, estimateJsonSizeBytes, estimateRawSizeBytes } from '../src/utils/bitPacking';
import { PacketField } from '../src/types';

describe('BitPacking Calculations', () => {
  it('should calculate correct bit width for boolean fields', () => {
    const field: PacketField = { id: '1', name: 'isAlive', type: 'bool', bitWidth: 1 };
    expect(getFieldBitWidth(field)).toBe(1);
  });

  it('should calculate correct bit width for integer fields', () => {
    // Unbounded / fixed bit width
    const field1: PacketField = { id: '2', name: 'score', type: 'int', bitWidth: 10 };
    expect(getFieldBitWidth(field1)).toBe(10);

    // Range-bounded (0 to 7 -> 3 bits)
    const field2: PacketField = { id: '3', name: 'ammo', type: 'int', bitWidth: 32, minValue: 0, maxValue: 7 };
    expect(getFieldBitWidth(field2)).toBe(3);

    // Range-bounded (10 to 20 -> range of 10 -> 4 bits)
    const field3: PacketField = { id: '4', name: 'level', type: 'int', bitWidth: 32, minValue: 10, maxValue: 20 };
    expect(getFieldBitWidth(field3)).toBe(4); // 2^4 = 16, fits range of 11 values (10 to 20)
  });

  it('should calculate correct bit width for float fields', () => {
    // Single precision (32 bits)
    const fieldSingle: PacketField = { id: '5', name: 'posX', type: 'float', bitWidth: 32, floatType: 'single' };
    expect(getFieldBitWidth(fieldSingle)).toBe(32);

    // Half precision (16 bits)
    const fieldHalf: PacketField = { id: '6', name: 'posY', type: 'float', bitWidth: 32, floatType: 'half' };
    expect(getFieldBitWidth(fieldHalf)).toBe(16);

    // Quantized float (range -10.0 to 10.0 with 0.1 precision -> 200 steps -> 8 bits)
    const fieldQuant: PacketField = {
      id: '7',
      name: 'posZ',
      type: 'float',
      bitWidth: 32,
      floatType: 'quantized',
      minValue: -10,
      maxValue: 10,
      precision: 0.1
    };
    // 20 / 0.1 = 200. log2(200) = 7.64 -> ceiling = 8 bits. Max steps = 201 values (including 0). 2^8 = 256.
    expect(getFieldBitWidth(fieldQuant)).toBe(8);
  });

  it('should calculate correct bit width for Vector3 fields', () => {
    // Full precision (96 bits)
    const fieldFull: PacketField = { id: '8', name: 'velocity', type: 'vector3', bitWidth: 96, vectorType: 'full' };
    expect(getFieldBitWidth(fieldFull)).toBe(96);

    // Quantized Vector3 (each component between -50 and 50 with 0.2 precision)
    // Range = 100. 100 / 0.2 = 500 steps. log2(500) = 8.96 -> ceiling = 9 bits per component.
    // 9 * 3 = 27 bits total.
    const fieldQuant: PacketField = {
      id: '9',
      name: 'position',
      type: 'vector3',
      bitWidth: 96,
      vectorType: 'quantized',
      minValue: -50,
      maxValue: 50,
      vectorPrecision: 0.2
    };
    expect(getFieldBitWidth(fieldQuant)).toBe(27);
  });

  it('should calculate correct bit width for string fields', () => {
    // Fixed length string (10 chars -> 80 bits)
    const fieldFixed: PacketField = { id: '10', name: 'tag', type: 'string', bitWidth: 80, stringType: 'fixed', maxStringLength: 10 };
    expect(getFieldBitWidth(fieldFixed)).toBe(80);

    // Dynamic length string (10 chars -> 80 bits + 8 bits length prefix since 10 < 256)
    const fieldDyn: PacketField = { id: '11', name: 'username', type: 'string', bitWidth: 80, stringType: 'dynamic', maxStringLength: 10 };
    expect(getFieldBitWidth(fieldDyn)).toBe(88);
  });

  it('should compute correct layout offsets and packing alignments', () => {
    const fields: PacketField[] = [
      { id: '1', name: 'bool1', type: 'bool', bitWidth: 1 },
      { id: '2', name: 'int3', type: 'int', bitWidth: 3 },
      { id: '3', name: 'bool2', type: 'bool', bitWidth: 1 }
    ];

    const result = calculatePacketLayout(fields);
    expect(result.totalBits).toBe(5);
    expect(result.totalBytes).toBe(1);
    expect(result.paddingBits).toBe(3);

    expect(result.layoutFields[0].bitOffset).toBe(0);
    expect(result.layoutFields[1].bitOffset).toBe(1);
    expect(result.layoutFields[2].bitOffset).toBe(4);
  });
});
