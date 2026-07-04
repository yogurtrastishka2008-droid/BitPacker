export type Language = 'en' | 'ru';

export const translations = {
  en: {
    headerTitle: 'BitPacker',
    headerSubtitle: 'Visual Game Netcode Designer & Bandwidth Simulator',
    targetPlatforms: 'Target: Roblox, s&box, Unity',
    statusReady: 'Buffer API Ready',
    footerText: 'Built for Roblox, s&box & Unity multiplayer optimization.',
    footerVersion: 'BitPacker v1.0.0 // Ready.',
    
    // Packet Editor
    editorTitle: 'Packet Schema Designer',
    editorDesc: 'Define your network variables and specify their bit-level compression rules.',
    fieldNamePlaceholder: 'Field Name (e.g. position, ammo)',
    fieldTypeInt: 'Integer (bits/range)',
    fieldTypeBool: 'Boolean (1 bit)',
    fieldTypeFloat: 'Float (IEEE/Quantized)',
    fieldTypeVector: 'Vector3 (3D coords)',
    fieldTypeString: 'String (UTF-8)',
    btnAdd: 'Add',
    noFields: 'No fields defined yet. Add your first field above to begin packing.',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    removeField: 'Remove Field',
    
    // Config Labels
    minValue: 'Min Value',
    maxValue: 'Max Value',
    staticBitWidth: 'Static Bit Width',
    autoBits: 'Auto Bits',
    encoding: 'Encoding',
    precision: 'Precision (Step)',
    sizeAllocation: 'Size Allocation',
    lengthType: 'Length Type',
    maxCharLength: 'Max Char Length',
    boolNotice: 'Booleans are packed as a single bit (1/8th of a byte) alongside adjacent variables.',
    
    // Select options
    floatSingle: 'Single Float (32-bit)',
    floatHalf: 'Half Float (16-bit)',
    floatQuantized: 'Quantized Range',
    vectorFull: 'Full (96-bit)',
    vectorQuantized: 'Quantized Bounds',
    stringDynamic: 'Dynamic (Header length)',
    stringFixed: 'Fixed size',
    
    // Simulator Dashboard
    simTitle: 'Bandwidth Simulator',
    simDesc: 'Tweak players, replication frequency, and protocol options to see how minor changes scale globally.',
    playerCount: 'Player Count',
    tickRate: 'Server Tick Rate',
    packetsPerTick: 'Packets Per Tick',
    ticksSec: 'Hz (Ticks/sec)',
    perTick: '/ tick',
    protocolEnvelope: 'Protocol Overhead Envelope',
    overhead: 'overhead',
    singlePacketComp: 'Single Packet Composition',
    payload: 'Payload',
    totalBytes: 'bytes',
    
    // Bandwidth Chart
    chartTitle: 'Server Egress Bandwidth',
    chartDesc: 'Global downstream server traffic per second (replication to all peers).',
    egressBitpacked: 'Egress (BitPacked)',
    egressRaw: 'Egress (Raw)',
    egressJson: 'Egress (JSON)',
    scaleLinear: 'Linear Scaling (Dedicated)',
    scaleQuadratic: 'Quadratic Broadcast Egress (N*(N-1) broadcast replication)',
    
    // Code Generator
    codegenTitle: 'Generated Serializer Snippets',
    codegenDesc: 'Optimized, syntax-valid copyable buffer writing and parsing code matching this layout.',
    copyBtn: 'Copy Snippet',
    copiedBtn: 'Copied!',
    tabRoblox: 'Roblox (Luau)',
    tabSbox: 's&box (C#)',
    tabUnity: 'Unity (NGO C#)',
    
    // Bit Visualizer
    visualizerTitle: 'Byte Grid Alignment Visualizer',
    visualizerDesc: 'Watch how variables pack into bit registers and where bytes align.',
    legendPacked: 'Packed bits',
    legendPadding: 'Padding bits',
    legendUnused: 'Unused bit space',
    wasteWarning: 'Padding Waste Warning: Multi-byte fields pushed to boundaries. Reorder fields to pack better!',
    efficiency: 'Efficiency',
    bitsUsed: 'Bits Used',
    totalSize: 'Total Size',
    padding: 'Padding'
  },
  ru: {
    headerTitle: 'BitPacker',
    headerSubtitle: 'Дизайнер Сетевых Пакетов и Симулятор Трафика',
    targetPlatforms: 'Платформы: Roblox, s&box, Unity',
    statusReady: 'Буфер API готов',
    footerText: 'Создано для оптимизации сетевого кода в Roblox, s&box и Unity.',
    footerVersion: 'BitPacker v1.0.0 // Готов к работе.',
    
    // Packet Editor
    editorTitle: 'Конструктор Сетевого Пакета',
    editorDesc: 'Определите сетевые переменные и укажите правила их битового сжатия.',
    fieldNamePlaceholder: 'Имя поля (например, position, ammo)',
    fieldTypeInt: 'Целое число (биты/диапазон)',
    fieldTypeBool: 'Логическое (1 бит)',
    fieldTypeFloat: 'Число с плавающей точкой',
    fieldTypeVector: 'Vector3 (3D координаты)',
    fieldTypeString: 'Строка (UTF-8)',
    btnAdd: 'Добавить',
    noFields: 'Поля еще не созданы. Добавьте первое поле выше для начала упаковки.',
    moveUp: 'Вверх',
    moveDown: 'Вниз',
    removeField: 'Удалить поле',
    
    // Config Labels
    minValue: 'Мин. значение',
    maxValue: 'Макс. значение',
    staticBitWidth: 'Фикс. ширина (бит)',
    autoBits: 'Авто биты',
    encoding: 'Кодирование',
    precision: 'Точность (Шаг)',
    sizeAllocation: 'Выделенный размер',
    lengthType: 'Тип длины',
    maxCharLength: 'Макс. символов',
    boolNotice: 'Логические переменные упаковываются в 1 бит (1/8 байта) рядом с другими полями.',
    
    // Select options
    floatSingle: 'Одинарная точность (32 бита)',
    floatHalf: 'Половинная точность (16 бит)',
    floatQuantized: 'Квантованный диапазон',
    vectorFull: 'Полный (96 бит)',
    vectorQuantized: 'Квантованные границы',
    stringDynamic: 'Динамическая (с заголовком)',
    stringFixed: 'Фиксированный размер',
    
    // Simulator Dashboard
    simTitle: 'Симулятор Трафика',
    simDesc: 'Настраивайте число игроков, частоту тиков и протокол, чтобы увидеть масштаб оптимизации.',
    playerCount: 'Количество игроков',
    tickRate: 'Частота тиков (Tick Rate)',
    packetsPerTick: 'Пакетов за тик',
    ticksSec: 'Гц (Тиков/сек)',
    perTick: '/ тик',
    protocolEnvelope: 'Накладные расходы протокола',
    overhead: 'расходы',
    singlePacketComp: 'Состав единичного пакета',
    payload: 'Полезная нагрузка',
    totalBytes: 'байт',
    
    // Bandwidth Chart
    chartTitle: 'Исходящий Трафик Сервера',
    chartDesc: 'Суммарный объем трафика в секунду при рассылке всем подключенным игрокам.',
    egressBitpacked: 'Трафик (BitPacked)',
    egressRaw: 'Трафик (Raw)',
    egressJson: 'Трафик (JSON)',
    scaleLinear: 'Линейное масштабирование (Выделенный)',
    scaleQuadratic: 'Квадратичная рассылка (Репликация N*(N-1))',
    
    // Code Generator
    codegenTitle: 'Генератор Кода Сериализации',
    codegenDesc: 'Оптимизированные и готовые к копированию скрипты записи и чтения буферов под этот макет.',
    copyBtn: 'Копировать код',
    copiedBtn: 'Скопировано!',
    tabRoblox: 'Roblox (Luau)',
    tabSbox: 's&box (C#)',
    tabUnity: 'Unity (NGO C#)',
    
    // Bit Visualizer
    visualizerTitle: 'Сетка Распределения Бит в Байте',
    visualizerDesc: 'Визуализация распределения переменных по битовым регистрам и байтам.',
    legendPacked: 'Занятые биты',
    legendPadding: 'Биты выравнивания',
    legendUnused: 'Свободное место',
    wasteWarning: 'Предупреждение о выравнивании: крупные поля смещены к границе байта. Попробуйте поменять поля местами для лучшей плотности!',
    efficiency: 'Эффективность',
    bitsUsed: 'Использовано бит',
    totalSize: 'Общий размер',
    padding: 'Выравнивание'
  }
};
