import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, LayoutGrid, List, SearchX, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { devices } from '../../../data/devices';
import { CATEGORY_LABELS, protocolsForDevice } from '../../../entities/device/lib/device-utils';
import type { AudioProtocol, Device, DeviceCategory } from '../../../entities/device/model/types';
import { FrontPanelPreview } from '../../../entities/device/ui/FrontPanelSvg';
import { cn } from '../../../shared/lib/cn';
import { protocolMeta } from '../../../shared/audio';
import { ProtocolDot } from '../../../shared/audio/ProtocolDot';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Chip } from '../../../shared/ui/Chip';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Eyebrow } from '../../../shared/ui/Eyebrow';
import { Kbd } from '../../../shared/ui/Kbd';
import { SearchInput } from '../../../shared/ui/Input';
import { Tooltip } from '../../../shared/ui/Tooltip';
import { useRackStore } from '../../rack/model/use-rack-store';
import { useFilteredDevices } from '../model/use-filtered-devices';

const ALL_CATEGORIES = Array.from(new Set(devices.map((d) => d.category)));
const ALL_PROTOCOLS = Array.from(
  new Set(devices.flatMap((d) => protocolsForDevice(d))),
) as AudioProtocol[];

interface DeviceLibraryProps {
  className?: string;
  onDeviceAdded?: () => void;
}

export function DeviceLibrary({ className, onDeviceAdded }: DeviceLibraryProps) {
  const filters = useRackStore((state) => state.devicePanelFilter);
  const setFilters = useRackStore((state) => state.setFilters);
  const placeDeviceInFirstAvailableSlot = useRackStore(
    (state) => state.placeDeviceInFirstAvailableSlot,
  );
  const results = useFilteredDevices(filters);

  const [filterOpen, setFilterOpen] = useState(false);

  const resetFilters = () =>
    setFilters({ query: '', categories: [], protocols: [], rackUnits: 'all' });

  const toggleCategory = (cat: DeviceCategory) =>
    setFilters({
      categories: filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });

  const toggleProtocol = (proto: AudioProtocol) =>
    setFilters({
      protocols: filters.protocols.includes(proto)
        ? filters.protocols.filter((p) => p !== proto)
        : [...filters.protocols, proto],
    });

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; remove: () => void }> = [];
    filters.categories.forEach((cat) =>
      chips.push({
        key: `cat:${cat}`,
        label: CATEGORY_LABELS[cat],
        remove: () => toggleCategory(cat),
      }),
    );
    filters.protocols.forEach((proto) =>
      chips.push({
        key: `proto:${proto}`,
        label: protocolMeta(proto).label,
        remove: () => toggleProtocol(proto),
      }),
    );
    if (filters.rackUnits !== 'all') {
      chips.push({
        key: 'units',
        label: `${filters.rackUnits}U`,
        remove: () => setFilters({ rackUnits: 'all' }),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categories, filters.protocols, filters.rackUnits]);

  return (
    <aside
      aria-label="Device library"
      className={cn(
        'device-library flex w-74 min-h-0 shrink-0 flex-col bg-surface border-r border-line',
        className,
      )}
      id="device-library"
    >
      {/* Header */}
      <div className="border-b border-line px-3.5 pb-2.5 pt-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div>
            <Eyebrow>Library</Eyebrow>
            <div className="mt-0.5 text-15 font-semibold">
              Devices{' '}
              <span className="font-normal text-muted-2">{results.length}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Tooltip content="Filters">
              <Button
                aria-label="Toggle filters"
                aria-pressed={filterOpen}
                onClick={() => setFilterOpen((open) => !open)}
                size="icon"
                variant={filterOpen ? 'secondary' : 'ghost'}
              >
                <SlidersHorizontal size={13} />
              </Button>
            </Tooltip>
            <Tooltip content={filters.mode === 'grid' ? 'Show as list' : 'Show as grid'}>
              <Button
                aria-label={filters.mode === 'grid' ? 'Show as list' : 'Show as grid'}
                onClick={() => setFilters({ mode: filters.mode === 'grid' ? 'list' : 'grid' })}
                size="icon"
                variant="ghost"
              >
                {filters.mode === 'grid' ? <List size={13} /> : <LayoutGrid size={13} />}
              </Button>
            </Tooltip>
          </div>
        </div>

        <SearchInput
          onValueChange={(next) => setFilters({ query: next })}
          placeholder="Search devices…"
          trailing={<Kbd>⌘K</Kbd>}
          value={filters.query}
        />

        {activeChips.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <Chip active key={chip.key} onDismiss={chip.remove}>
                {chip.label}
              </Chip>
            ))}
            <Chip asButton onClick={resetFilters}>
              Reset
            </Chip>
          </div>
        ) : null}

        {filterOpen ? (
          <FilterDropdown
            categories={filters.categories}
            onToggleCategory={toggleCategory}
            onToggleProtocol={toggleProtocol}
            onUnitsChange={(rackUnits) => setFilters({ rackUnits })}
            protocols={filters.protocols}
            rackUnits={filters.rackUnits}
            sort={filters.sort}
            onSortChange={(sort) => setFilters({ sort })}
          />
        ) : null}
      </div>

      {/* Body */}
      <div className="device-results min-h-0 flex-1 overflow-y-auto px-2 py-2.5">
        {results.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={resetFilters} size="sm">
                Clear filters
              </Button>
            }
            body={
              filters.query
                ? `No devices match "${filters.query}".`
                : 'Try widening the filter selection.'
            }
            icon={SearchX}
            title="Nothing found"
          />
        ) : filters.mode === 'list' ? (
          <div className="flex flex-col gap-1">
            {results.map((device) => (
              <DeviceCard
                device={device}
                key={device.id}
                onAdd={(deviceId) => {
                  placeDeviceInFirstAvailableSlot(deviceId);
                  onDeviceAdded?.();
                }}
                variant="list"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {results.map((device) => (
              <DeviceCard
                device={device}
                key={device.id}
                onAdd={(deviceId) => {
                  placeDeviceInFirstAvailableSlot(deviceId);
                  onDeviceAdded?.();
                }}
                variant="grid"
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// DeviceCard — grid + list variants
// ─────────────────────────────────────────────────────────────
function DeviceCard({
  device,
  variant,
  onAdd,
}: {
  device: Device;
  variant: 'grid' | 'list';
  onAdd: (id: string) => void;
}) {
  const suppressClick = useRef(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${device.id}`,
    data: { kind: 'library', deviceId: device.id },
  });
  useEffect(() => {
    if (isDragging) suppressClick.current = true;
  }, [isDragging]);

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onAdd(device.id);
  };

  if (variant === 'list') {
    return (
      <button
        {...listeners}
        {...attributes}
        className={cn(
          'flex items-center gap-2.5 rounded-2 border border-line bg-surface-2 ' +
            'px-2 py-1.5 text-left transition-colors duration-150 ease-standard',
          'hover:border-line-strong cursor-grab focus-visible:outline-none',
          isDragging && 'opacity-40',
        )}
        onClick={handleClick}
        ref={setNodeRef}
        type="button"
      >
        <div className="h-4.5 w-9 shrink-0 overflow-hidden rounded-1 border border-line bg-bg">
          <FrontPanelPreview device={device} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-12 font-medium text-copy">{device.name}</div>
          <div className="font-mono text-10 text-muted-2">
            {device.manufacturer} · {CATEGORY_LABELS[device.category]}
          </div>
        </div>
        <Badge>{device.rackUnits}U</Badge>
      </button>
    );
  }

  return (
    <button
      {...listeners}
      {...attributes}
      className={cn(
        'rounded-3 border border-line bg-surface-2 p-2 text-left',
        'transition-colors duration-150 ease-standard hover:border-line-strong',
        'cursor-grab focus-visible:outline-none',
        isDragging && 'opacity-40',
      )}
      onClick={handleClick}
      ref={setNodeRef}
      title={`${device.name} — ${device.manufacturer}`}
      type="button"
    >
      <div className="mb-2 h-12 w-full overflow-hidden rounded-1 border border-line bg-bg">
        <FrontPanelPreview device={device} />
      </div>
      <div className="mb-0.5 truncate text-12 font-medium leading-tight text-copy">
        {device.name}
      </div>
      <div className="flex items-center justify-between gap-1.5 font-mono text-10 text-muted-2">
        <span className="truncate">{device.manufacturer}</span>
        <Badge>{device.rackUnits}U</Badge>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Filter dropdown — chips for category + protocol, units + sort
// ─────────────────────────────────────────────────────────────
function FilterDropdown({
  categories,
  protocols,
  rackUnits,
  sort,
  onToggleCategory,
  onToggleProtocol,
  onUnitsChange,
  onSortChange,
}: {
  categories: DeviceCategory[];
  protocols: AudioProtocol[];
  rackUnits: 'all' | 1 | 2 | 3 | 4;
  sort: 'popularity' | 'name' | 'category';
  onToggleCategory: (cat: DeviceCategory) => void;
  onToggleProtocol: (proto: AudioProtocol) => void;
  onUnitsChange: (units: 'all' | 1 | 2 | 3 | 4) => void;
  onSortChange: (sort: 'popularity' | 'name' | 'category') => void;
}) {
  return (
    <div className="mt-3 rounded-3 border border-line bg-bg-2 p-2.5">
      <Eyebrow className="mb-1.5">Category</Eyebrow>
      <div className="mb-3 flex flex-wrap gap-1">
        {ALL_CATEGORIES.map((cat) => (
          <Chip
            active={categories.includes(cat)}
            asButton
            key={cat}
            onClick={() => onToggleCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </Chip>
        ))}
      </div>

      <Eyebrow className="mb-1.5">Protocol</Eyebrow>
      <div className="mb-3 flex flex-wrap gap-1">
        {ALL_PROTOCOLS.map((proto) => {
          const isActive = protocols.includes(proto);
          return (
            <Chip
              active={isActive}
              asButton
              key={proto}
              onClick={() => onToggleProtocol(proto)}
            >
              <ProtocolDot audioProtocol={proto} />
              {protocolMeta(proto).label}
            </Chip>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Eyebrow>U</Eyebrow>
          <div className="flex gap-1">
            <Chip
              active={rackUnits === 'all'}
              asButton
              onClick={() => onUnitsChange('all')}
            >
              All
            </Chip>
            {([1, 2, 3, 4] as const).map((u) => (
              <Chip active={rackUnits === u} asButton key={u} onClick={() => onUnitsChange(u)}>
                {u}U
              </Chip>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Eyebrow>Sort</Eyebrow>
          <SortToggle onChange={onSortChange} value={sort} />
        </div>
      </div>
    </div>
  );
}

function SortToggle({
  value,
  onChange,
}: {
  value: 'popularity' | 'name' | 'category';
  onChange: (value: 'popularity' | 'name' | 'category') => void;
}) {
  const options: Array<{ key: 'popularity' | 'name' | 'category'; label: string }> = [
    { key: 'popularity', label: 'Popular' },
    { key: 'name', label: 'A–Z' },
    { key: 'category', label: 'Type' },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-pill border border-line-2 bg-bg p-0.5">
      {options.map((option) => (
        <button
          aria-pressed={value === option.key}
          className={cn(
            'inline-flex h-5 items-center gap-1 rounded-pill px-2 font-mono text-10',
            value === option.key
              ? 'bg-accent-soft text-accent'
              : 'text-muted-2 hover:text-copy',
          )}
          key={option.key}
          onClick={() => onChange(option.key)}
          type="button"
        >
          {option.label}
          {value === option.key ? <ChevronDown className="hidden" size={9} /> : null}
        </button>
      ))}
    </div>
  );
}
