import React from 'react';
import { iconMap } from '../../constants/icons';

export const IconRender = ({ name, className }) => {
    const LucideIcon = iconMap[name] || iconMap['Default'];
    return <LucideIcon className={className} />;
};
