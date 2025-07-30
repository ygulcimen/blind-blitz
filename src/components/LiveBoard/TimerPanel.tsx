import React from 'react';
import TimerDisplay from './TimerDisplay';

interface TimerPanelProps {
  label: string;
  time: number;
  active?: boolean;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  label,
  time,
  active = false,
}) => {
  return <TimerDisplay label={label} time={time} active={active} />;
};

export default TimerPanel;
