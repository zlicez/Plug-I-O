import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { devices } from '../../../data/devices';
import { protocolsForDevice } from '../../../entities/device/lib/device-utils';
import type { Device } from '../../../entities/device/model/types';
import type { FilterState } from '../../rack/model/types';

export function useFilteredDevices(filters: FilterState): Device[] {
  const fuse = useMemo(
    () =>
      new Fuse(devices, {
        keys: ['name', 'manufacturer', 'tags'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );

  return useMemo(() => {
    const searched = filters.query.trim()
      ? fuse.search(filters.query.trim()).map((result) => result.item)
      : devices;
    const filtered = searched.filter(
      (device) =>
        (filters.categories.length === 0 || filters.categories.includes(device.category)) &&
        (filters.rackUnits === 'all' || filters.rackUnits === device.rackUnits) &&
        (filters.protocols.length === 0 ||
          protocolsForDevice(device).some((protocol) => filters.protocols.includes(protocol))),
    );
    return filtered.sort((left, right) => {
      if (filters.sort === 'name') return left.name.localeCompare(right.name);
      if (filters.sort === 'category') return left.category.localeCompare(right.category);
      return right.popularity - left.popularity;
    });
  }, [filters, fuse]);
}
