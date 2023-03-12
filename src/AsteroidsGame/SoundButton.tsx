import React from 'react';

import { ReactComponent as VolumeHighIcon } from '@/assets/images/icons/volume-high.svg';
import { ReactComponent as VolumeMuteIcon } from '@/assets/images/icons/volume-mute.svg';

interface SoundButtonProps {
  isActive?: boolean;
  onClick?: () => void;
}

const SoundButton = ({ isActive, onClick }: SoundButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{ color: '#fff' }}
    >
      {isActive ? <VolumeHighIcon /> : <VolumeMuteIcon />}
    </button>
  );
};

export default SoundButton;
