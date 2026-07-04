import { describe, it, expect } from 'vitest';
import { generateRobloxCode } from '../src/utils/generators/roblox';
import { generateSboxCode } from '../src/utils/generators/sbox';
import { generateUnityCode } from '../src/utils/generators/unity';
import type { PacketField } from '../src/types';

describe('Code Generators', () => {
  const mockFields: PacketField[] = [
    { id: '1', name: 'isAlive', type: 'bool', bitWidth: 1 },
    { id: '2', name: 'ammo', type: 'int', bitWidth: 8, minValue: 0, maxValue: 255 },
    { id: '3', name: 'tag', type: 'string', bitWidth: 80, stringType: 'fixed', maxStringLength: 10 }
  ];

  it('should generate valid Roblox Luau code', () => {
    const code = generateRobloxCode(mockFields);
    
    expect(code).toContain('local NetPacket = {}');
    expect(code).toContain('function NetPacket:Serialize(): buffer');
    expect(code).toContain('function NetPacket.Deserialize(buf: buffer): any');
    expect(code).toContain('buffer.writestring');
    expect(code).not.toContain('packHalf'); // No half-floats in mockFields
  });

  it('should include half-float packing helpers in Luau when a half-float is present', () => {
    const fieldsWithHalf: PacketField[] = [
      ...mockFields,
      { id: '4', name: 'weight', type: 'float', bitWidth: 16, floatType: 'half' }
    ];
    const code = generateRobloxCode(fieldsWithHalf);
    
    expect(code).toContain('local function packHalf');
    expect(code).toContain('local function unpackHalf');
    expect(code).toContain('packHalf(self.weight)');
    expect(code).toContain('unpackHalf(buffer.readu16(buf,');
  });

  it('should generate valid s&box C# code', () => {
    const code = generateSboxCode(mockFields);
    
    expect(code).toContain('public struct NetworkPacket');
    expect(code).toContain('public void Write(BinaryWriter writer)');
    expect(code).toContain('public static NetworkPacket Read(BinaryReader reader)');
    expect(code).toContain('System.Text.Encoding.UTF8.GetBytes');
  });

  it('should generate valid Unity NGO C# code with correct FixedString type mapping', () => {
    const fieldsWithLargeString: PacketField[] = [
      ...mockFields,
      { id: '5', name: 'motd', type: 'string', bitWidth: 400, stringType: 'dynamic', maxStringLength: 50 }
    ];
    const code = generateUnityCode(fieldsWithLargeString);
    
    expect(code).toContain('public struct NetworkPacket : INetworkSerializable');
    expect(code).toContain('public void NetworkSerialize<T>');
    expect(code).toContain('FastBufferWriter');
    expect(code).toContain('FixedString32Bytes tag;'); // 10 chars maps to <32B
    expect(code).toContain('FixedString64Bytes motd;'); // 50 chars maps to <64B
  });
});
