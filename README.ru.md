# BitPacker: Visual Game Netcode Designer & Bandwidth Simulator

<p align="left">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62C" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tests-100%25%20Passing-emerald?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

[English README](./README.md) | [Русское руководство](./README.ru.md)

**BitPacker** — это интерактивный веб-инструмент для проектирования битовых структур сетевых пакетов и точной симуляции сетевого трафика. Он разработан для оптимизации сетевого кода многопользовательских проектов на **Roblox (Luau)**, **s&box (C#)** и **Unity (C# NGO)**.

Упаковывая переменные на битовом уровне под их математические границы и генерируя готовый код сериализации, BitPacker устраняет лишние накладные расходы протоколов и сокращает исходящий трафик сервера до **90%**.

---

## ⚡ Ключевые возможности

* 🛠️ **Интерактивный конструктор схем (Schema Designer):**
  * Добавление полей: `bool`, `int` (с ограничениями диапазона или статическими битами), `float` (одинарный, половинный или квантованный), `vector3` (полный или квантованный) и `string` (динамическая или фиксированная).
  * Автоматический расчет минимальной ширины битов для целых чисел и квантованных полей на основе заданного диапазона значений.
  * Валидация имен переменных по черному списку ключевых слов C# и Luau для предотвращения конфликтов компиляции.
* 👁️ **Визуализатор битовой сетки (Bit-Layout Visualizer):**
  * Динамическая сетка распределения переменных (по 8 бит в строке), показывающая точное расположение полей в памяти.
  * Цветовая разметка облегчает поиск битов выравнивания (`padding`) и свободных битов в байтах.
  * Интерактивная подсветка с указанием байтовых индексов и битовых смещений при наведении курсора.
* 📊 **Симулятор трафика (Bandwidth Simulator):**
  * Моделирование репликации с квадратичной сложностью рассылки: $O(P \cdot (P - 1) \cdot Size \cdot Hz)$.
  * Динамический SVG-график сравнения трафика: **BitPacked** (Сжатый пакет) vs **Raw Struct** (Структура без сжатия) vs **JSON String**.
  * Подсчет накладных расходов популярных сетевых оболочек: Roblox RemoteEvents (+49Б), Unity NGO (+40Б), s&box Netcode (+42Б), а также чистых протоколов UDP (+28Б), TCP (+40Б) и WebSockets (+44Б).
* 💻 **Генератор кода сериализации:**
  * Мгновенный экспорт макета в готовые скрипты записи и чтения буферов.
  * **Roblox (Luau):** Использование стандартного API буферов (`buffer.writeu8`, `buffer.writef32`) с внедренной поддержкой полуточных float (IEEE 754 half-float 16 бит).
  * **s&box (C#):** Потоковое чтение/запись через `BinaryWriter`/`BinaryReader` с защитой от переполнения UTF-8 при кодировании строк.
  * **Unity (NGO C#):** Реализация интерфейса `INetworkSerializable` через `FastBufferWriter`/`FastBufferReader` с динамическим сопоставлением типов строк (например, `FixedString32Bytes`, `FixedString64Bytes`).

---

## 🚀 Быстрый запуск

### Требования
* Установленный **Node.js** (версии 18.0.0 или новее)

### Установка зависимостей
Склонируйте репозиторий и установите пакеты:
```bash
npm install
```

### Запуск в режиме разработки
Запустите сервер Vite:
```bash
npm run dev
```
Откройте [http://localhost:5173/](http://localhost:5173/) в браузере.

### Запуск Unit-тестов
Запустите Vitest для проверки корректности расчетов макета, симулятора и генераторов кода:
```bash
npm test
```

### Сборка проекта
Скомпилируйте проект для публикации:
```bash
npm run build
```

---

<details>
<summary>📖 Техническая справка и математические модели</summary>

### 1. Формула квантования Float и Vector3
Квантование преобразует дробные значения из вещественного диапазона в компактные целые числа. Для заданных `minValue`, `maxValue` и точности `precision`, минимальная ширина поля в битах $b$ рассчитывается как:
$$b = \lceil \log_2 \left( \frac{maxValue - minValue}{precision} \right) \rceil$$
При сериализации значение обрезается и масштабируется:
$$integer\_val = \text{round}\left( \frac{value - minValue}{precision} \right)$$
При десериализации восстанавливается вещественное значение:
$$value = (integer\_val \cdot precision) + minValue$$

### 2. Формула исходящего трафика (Replication Egress)
В мультиплеерных играх трафик рассылки сервера растет квадратично, если сервер транслирует состояние каждого игрока всем остальным клиентам. Симулятор рассчитывает исходящую скорость сервера в Килобитах в секунду (Kbps) по формуле:
$$\text{Egress (Kbps)} = \frac{P \cdot (P - 1) \cdot (Size + Overhead) \cdot \text{Rate} \cdot 8}{1000}$$
Где $P$ — количество игроков, $Size$ — размер полезных данных в байтах, $Overhead$ — накладные расходы сетевого протокола, а $Rate$ — частота тиков сервера в Гц (Tick Rate).
</details>

---

## 📂 Структура проекта

* [src/types/](file:///C:/Users/yogur/BitPacker/src/types/) — Описание TypeScript типов.
* [src/components/](file:///C:/Users/yogur/BitPacker/src/components/) — Панели интерфейса (редактор схемы, визуализатор байтов, SVG-графики).
* [src/utils/generators/](file:///C:/Users/yogur/BitPacker/src/utils/generators/) — Шаблоны генерации Luau, s&box и Unity Ngo.
* [src/utils/bitPacking.ts](file:///C:/Users/yogur/BitPacker/src/utils/bitPacking.ts) — Логика расчета смещений и выравнивания байтов.
* [src/utils/simulation.ts](file:///C:/Users/yogur/BitPacker/src/utils/simulation.ts) — Формулы симулятора трафика.
* [tests/](file:///C:/Users/yogur/BitPacker/tests/) — Unit-тесты для математических расчетов и кодогенераторов.

---

## 📄 Лицензия
Этот проект выпускается под лицензией MIT. Подробности см. в файле [LICENSE](./LICENSE).
