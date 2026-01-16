'use client';

import { Drawer } from '@lobehub/ui';

import DeveloperProfile from './developer-profile';

// Mock constants since files are missing
const isDesktop = true;
const TITLE_BAR_HEIGHT = 0;

interface DeveloperPanelProps {
  onClose: () => void;
  open: boolean;
}

export default function DeveloperPanel({ open, onClose }: DeveloperPanelProps) {
  return (
    <Drawer
      height={isDesktop ? `calc(100vh - ${TITLE_BAR_HEIGHT}px)` : '100vh'}
      noHeader
      onClose={onClose}
      open={open}
      placement={'bottom'}
    >
      <DeveloperProfile />
    </Drawer>
  );
}
