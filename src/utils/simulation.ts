import type { SimulationConfig, ComparisonMetrics, NetworkProtocol } from '../types';

/**
 * Returns the baseline packet wrapper and transport overhead in bytes for a given protocol.
 */
export function getProtocolOverheadBytes(protocol: NetworkProtocol, customOverhead?: number): number {
  if (customOverhead !== undefined) {
    return customOverhead;
  }

  switch (protocol) {
    case 'udp':
      // 20 bytes IPv4 Header + 8 bytes UDP Header
      return 28;
    case 'tcp':
      // 20 bytes IPv4 Header + 20 bytes TCP Header
      return 40;
    case 'websocket':
      // 20 bytes IP + 20 bytes TCP + 4 bytes average WebSocket framing overhead
      return 44;
    case 'roblox':
      // 28 bytes UDP/IP + ~12 bytes Roblox channel packet header + ~9 bytes RemoteEvent caller overhead
      return 49;
    case 'unity':
      // 28 bytes UDP/IP + ~6 bytes NGO message header + ~6 bytes Unity Transport envelope
      return 40;
    case 'sbox':
      // 28 bytes UDP/IP + ~14 bytes Steamworks socket frame / s&box network channel packaging
      return 42;
    default:
      return 28;
  }
}

/**
 * Runs a complete traffic simulation, calculating Kbps and MB/hour for all three serialization methods.
 * Models O(N^2) multiplayer replication bandwidth where:
 * - Each client uploads its own packets to the server (Client Upload / Server Download).
 * - The server replicates all clients' data to every other client (Server Upload / Client Download).
 */
export function runBandwidthSimulation(
  payloadBitPackedBytes: number,
  payloadJsonBytes: number,
  payloadRawBytes: number,
  config: SimulationConfig
): {
  clientEgress: ComparisonMetrics; // Client Upload (own packet only)
  clientIngress: ComparisonMetrics; // Client Download (all other players' packets)
  serverEgress: ComparisonMetrics; // Server Upload (broadcasting everyone's packets to everyone)
  serverIngress: ComparisonMetrics; // Server Download (receiving everyone's packets)
} {
  const { playerCount, tickRate, packetsPerTick, protocol, customOverheadBytes } = config;
  const overheadBytes = getProtocolOverheadBytes(protocol, customOverheadBytes);

  // Total messages sent per client per second
  const messagesPerSecond = tickRate * packetsPerTick;

  // Single packet total bytes (payload + overhead)
  const totalBitPackedBytes = payloadBitPackedBytes + overheadBytes;
  const totalJsonBytes = payloadJsonBytes + overheadBytes;
  const totalRawBytes = payloadRawBytes + overheadBytes;

  // 1. Client Egress (Upload bandwidth for 1 client sending its own data)
  const clientEgress = calculateMetricsForSize(
    payloadBitPackedBytes,
    totalBitPackedBytes,
    totalJsonBytes,
    totalRawBytes,
    messagesPerSecond,
    overheadBytes
  );

  // 2. Server Ingress (Download bandwidth for the server receiving all clients' data)
  // Server Ingress = Client Egress * player count
  const serverIngress = scaleMetrics(clientEgress, playerCount);

  // 3. Client Ingress (Download bandwidth for 1 client receiving updates of all other players)
  // Client Ingress = Client Egress * (player count - 1)
  const clientIngress = scaleMetrics(clientEgress, Math.max(0, playerCount - 1));

  // 4. Server Egress (Upload bandwidth for the server broadcasting all clients' data to all clients)
  // Server Egress = Client Egress * player count * (player count - 1)
  const serverEgress = scaleMetrics(clientEgress, playerCount * Math.max(0, playerCount - 1));

  return {
    clientEgress,
    clientIngress,
    serverEgress,
    serverIngress
  };
}

/**
 * Calculates raw metrics for a given set of payload and total packet sizes.
 */
function calculateMetricsForSize(
  packedPayload: number,
  packedTotal: number,
  jsonTotal: number,
  rawTotal: number,
  messagesPerSecond: number,
  overheadBytes: number
): ComparisonMetrics {
  // Kbps = (Bytes * 8 bits/byte * messagesPerSecond) / 1000
  const bitPackedKbps = (packedTotal * 8 * messagesPerSecond) / 1000;
  const jsonKbps = (jsonTotal * 8 * messagesPerSecond) / 1000;
  const rawKbps = (rawTotal * 8 * messagesPerSecond) / 1000;

  // MB/hour = (Bytes * messagesPerSecond * 3600 seconds) / (1024 * 1024)
  const bitPackedMbHour = (packedTotal * messagesPerSecond * 3600) / (1024 * 1024);
  const jsonMbHour = (jsonTotal * messagesPerSecond * 3600) / (1024 * 1024);
  const rawMbHour = (rawTotal * messagesPerSecond * 3600) / (1024 * 1024);

  return {
    bitPackedBytes: packedTotal,
    jsonBytes: jsonTotal,
    rawBytes: rawTotal,
    
    bitPackedKbps,
    jsonKbps,
    rawKbps,
    
    bitPackedMbHour,
    jsonMbHour,
    rawMbHour,
    
    overheadBytes: overheadBytes,
    payloadBytes: packedPayload
  };
}

/**
 * Helper to scale metrics by a factor (e.g. player counts).
 */
function scaleMetrics(metrics: ComparisonMetrics, factor: number): ComparisonMetrics {
  return {
    bitPackedBytes: metrics.bitPackedBytes * factor,
    jsonBytes: metrics.jsonBytes * factor,
    rawBytes: metrics.rawBytes * factor,
    
    bitPackedKbps: metrics.bitPackedKbps * factor,
    jsonKbps: metrics.jsonKbps * factor,
    rawKbps: metrics.rawKbps * factor,
    
    bitPackedMbHour: metrics.bitPackedMbHour * factor,
    jsonMbHour: metrics.jsonMbHour * factor,
    rawMbHour: metrics.rawMbHour * factor,
    
    overheadBytes: metrics.overheadBytes * factor,
    payloadBytes: metrics.payloadBytes * factor
  };
}
