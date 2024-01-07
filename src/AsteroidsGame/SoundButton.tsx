import React from 'react';

import { ReactComponent as VolumeHighIcon } from '@/assets/images/icons/volume-high.svg';
import { ReactComponent as VolumeMuteIcon } from '@/assets/images/icons/volume-mute.svg';

interface SoundButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const SoundButton = ({ isActive, onClick, className }: SoundButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={className}
    >
      {isActive ? <VolumeHighIcon /> : <VolumeMuteIcon />}
    </button>
  );
};

export default SoundButton;
