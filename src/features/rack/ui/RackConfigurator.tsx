import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { RACK_SIZES } from '../../../entities/device/lib/device-utils';
import { Button } from '../../../shared/ui/Button';
import { useRackStore } from '../model/use-rack-store';

export function RackConfigurator() {
  const configured = useRackStore((state) => state.rackConfigured);
  const configureRack = useRackStore((state) => state.configureRack);
  return (
    <Dialog.Root open={!configured}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content aria-describedby="rack-config-description" className="rack-config">
          <Dialog.Title>Choose a rack frame</Dialog.Title>
          <Dialog.Description id="rack-config-description">
            Select the available vertical capacity for this studio build.
          </Dialog.Description>
          <div className="rack-options">
            {RACK_SIZES.map((size, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                key={size}
                transition={{ delay: index * 0.04 }}
              >
                <Button onClick={() => configureRack(size)} variant="secondary">
                  <span className="mini-rack" style={{ height: `${size * 2 + 10}px` }} />
                  <strong>{size}U</strong>
                  <small>19 in rack</small>
                </Button>
              </motion.div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
