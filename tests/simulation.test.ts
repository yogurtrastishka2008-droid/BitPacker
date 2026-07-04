import { describe, it, expect } from 'vitest';
import { getProtocolOverheadBytes, runBandwidthSimulation } from '../src/utils/simulation';
import { SimulationConfig } from '../src/types';

describe('Traffic Simulator Calculations', () => {
  it('should return correct protocol overheads', () => {
    expect(getProtocolOverheadBytes('udp')).toBe(28);
    expect(getProtocolOverheadBytes('tcp')).toBe(40);
    expect(getProtocolOverheadBytes('websocket')).toBe(44);
    expect(getProtocolOverheadBytes('roblox')).toBe(49);
    expect(getProtocolOverheadBytes('unity')).toBe(40);
    expect(getProtocolOverheadBytes('sbox')).toBe(42);
    
    // Custom overhead support
    expect(getProtocolOverheadBytes('udp', 100)).toBe(100);
  });

  it('should accurately simulate bandwidth scaling based on player count and tick rate', () => {
    // Layout size: BitPacked: 2 bytes, JSON: 50 bytes, Raw: 12 bytes
    const bitPackedBytes = 2;
    const jsonBytes = 50;
    const rawBytes = 12;

    const config: SimulationConfig = {
      playerCount: 10,
      tickRate: 20,
      packetsPerTick: 1,
      protocol: 'udp' // 28 bytes overhead
    };

    const sim = runBandwidthSimulation(bitPackedBytes, jsonBytes, rawBytes, config);

    // Protocol overhead is 28 bytes
    // Single packet size: payload + overhead
    // BitPacked packet: 2 + 28 = 30 bytes
    // JSON packet: 50 + 28 = 78 bytes
    // Raw packet: 12 + 28 = 40 bytes

    // 1. Client Egress: Upload size for 1 client
    expect(sim.clientEgress.bitPackedBytes).toBe(30);
    expect(sim.clientEgress.jsonBytes).toBe(78);
    expect(sim.clientEgress.rawBytes).toBe(40);

    // Messages per second = 20 * 1 = 20
    // BitPacked client upload Kbps = (30 * 8 * 20) / 1000 = 4800 / 1000 = 4.8 Kbps
    expect(sim.clientEgress.bitPackedKbps).toBeCloseTo(4.8);
    // JSON client upload Kbps = (78 * 8 * 20) / 1000 = 12.48 Kbps
    expect(sim.clientEgress.jsonKbps).toBeCloseTo(12.48);

    // 2. Server Ingress: receiving all 10 clients' packets
    // Server Ingress = clientEgress * playerCount = 4.8 * 10 = 48 Kbps
    expect(sim.serverIngress.bitPackedKbps).toBeCloseTo(48.0);
    expect(sim.serverIngress.jsonKbps).toBeCloseTo(124.8);

    // 3. Client Ingress: receiving 9 other players' packets
    // Client Ingress = clientEgress * 9 = 4.8 * 9 = 43.2 Kbps
    expect(sim.clientIngress.bitPackedKbps).toBeCloseTo(43.2);

    // 4. Server Egress: server transmitting 10 * 9 = 90 packets per second * packets per tick
    // Server Egress = clientEgress * 10 * 9 = 4.8 * 90 = 432 Kbps
    expect(sim.serverEgress.bitPackedKbps).toBeCloseTo(432.0);
  });
});
