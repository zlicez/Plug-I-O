import { useDraggable } from '@dnd-kit/core';
import * as Popover from '@radix-ui/react-popover';
import { GripVertical, LayoutGrid, List, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { devices } from '../../../data/devices';
import { CATEGORY_LABELS, protocolsForDevice } from '../../../entities/device/lib/device-utils';
import type { AudioProtocol, Device, DeviceCategory } from '../../../entities/device/model/types';
import { FrontPanelPreview } from '../../../entities/device/ui/FrontPanelSvg';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { useRackStore } from '../../rack/model/use-rack-store';
import { useFilteredDevices } from '../model/use-filtered-devices';

const categories = Array.from(new Set(devices.map((device) => device.category)));
const protocols = Array.from(
  new Set(devices.flatMap((device) => protocolsForDevice(device))),
) as AudioProtocol[];

function DeviceCard({
  device,
  list,
  onAdd,
}: {
  device: Device;
  list: boolean;
  onAdd: (deviceId: string) => void;
}) {
  const suppressClick = useRef(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${device.id}`,
    data: { kind: 'library', deviceId: device.id },
  });
  useEffect(() => {
    if (isDragging) suppressClick.current = true;
  }, [isDragging]);
  return (
    <button
      {...listeners}
      {...attributes}
      className={cn('device-card', list && 'device-card--list', isDragging && 'is-dragging')}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onAdd(device.id);
      }}
      ref={setNodeRef}
      type="button"
    >
      <FrontPanelPreview device={device} />
      <div className="device-card__content">
        <strong>{device.name}</strong>
        <span>{CATEGORY_LABELS[device.category]}</span>
        <small>{device.rackUnits}U</small>
      </div>
      <span aria-hidden className="drag-handle">
        <GripVertical size={15} />
      </span>
    </button>
  );
}

function CheckboxFilter<T extends string>({
  label,
  values,
  active,
  labels,
  onChange,
}: {
  label: string;
  values: T[];
  active: T[];
  labels?: Record<T, string>;
  onChange: (value: T[]) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button size="sm" variant="secondary">
          {label}
          {active.length > 0 && <b>{active.length}</b>}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" className="filter-popover" sideOffset={6}>
          {values.map((value) => (
            <label key={value}>
              <input
                checked={active.includes(value)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...active, value]
                      : active.filter((current) => current !== value),
                  )
                }
                type="checkbox"
              />
              {labels?.[value] ?? value.replaceAll('_', ' ')}
            </label>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

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
  const hasActiveFilters =
    filters.query.length > 0 ||
    filters.categories.length > 0 ||
    filters.protocols.length > 0 ||
    filters.rackUnits !== 'all';
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category, CATEGORY_LABELS[category]]),
      ) as Record<DeviceCategory, string>,
    [],
  );

  return (
    <aside className={cn('device-library', className)} aria-label="Device library" id="device-library">
      <header>
        <div>
          <p className="eyebrow">DEVICE LIBRARY</p>
          <strong>{results.length} results</strong>
        </div>
        <Button
          aria-label={filters.mode === 'grid' ? 'Show as list' : 'Show as grid'}
          onClick={() => setFilters({ mode: filters.mode === 'grid' ? 'list' : 'grid' })}
          size="icon"
          variant="ghost"
        >
          {filters.mode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
        </Button>
      </header>
      <label className="search-field">
        <Search aria-hidden size={17} />
        <input
          onChange={(event) => setFilters({ query: event.target.value })}
          placeholder="Search devices or makers"
          value={filters.query}
        />
        {filters.query && (
          <button aria-label="Clear search" onClick={() => setFilters({ query: '' })} type="button">
            <X size={14} />
          </button>
        )}
      </label>
      <div className="device-filters">
        <CheckboxFilter
          active={filters.categories}
          label="Category"
          labels={categoryLabels}
          onChange={(value) => setFilters({ categories: value })}
          values={categories}
        />
        <CheckboxFilter
          active={filters.protocols}
          label="Protocol"
          onChange={(value) => setFilters({ protocols: value })}
          values={protocols}
        />
        <label className="unit-select">
          <SlidersHorizontal size={13} />
          <select
            onChange={(event) =>
              setFilters({
                rackUnits:
                  event.target.value === 'all'
                    ? 'all'
                    : (Number(event.target.value) as 1 | 2 | 3 | 4),
              })
            }
            value={filters.rackUnits}
          >
            <option value="all">All U</option>
            {[1, 2, 3, 4].map((size) => (
              <option key={size} value={size}>
                {size}U
              </option>
            ))}
          </select>
        </label>
        <select
          aria-label="Sort devices"
          className="sort-select"
          onChange={(event) =>
            setFilters({ sort: event.target.value as 'popularity' | 'name' | 'category' })
          }
          value={filters.sort}
        >
          <option value="popularity">Popular</option>
          <option value="name">Name A-Z</option>
          <option value="category">Category</option>
        </select>
        {hasActiveFilters && (
          <Button
            aria-label="Clear all filters"
            className="clear-filters"
            onClick={() =>
              setFilters({ query: '', categories: [], protocols: [], rackUnits: 'all' })
            }
            size="sm"
            variant="ghost"
          >
            <X size={13} /> Clear
          </Button>
        )}
      </div>
      <div className={cn('device-results', filters.mode === 'list' && 'device-results--list')}>
        {results.length === 0 ? (
          <div className="device-empty">
            <SearchX size={22} />
            <strong>No matching devices</strong>
            <Button
              onClick={() =>
                setFilters({ query: '', categories: [], protocols: [], rackUnits: 'all' })
              }
              size="sm"
              variant="secondary"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          results.map((device) => (
            <DeviceCard
              device={device}
              key={device.id}
              list={filters.mode === 'list'}
              onAdd={(deviceId) => {
                placeDeviceInFirstAvailableSlot(deviceId);
                onDeviceAdded?.();
              }}
            />
          ))
        )}
      </div>
    </aside>
  );
}
