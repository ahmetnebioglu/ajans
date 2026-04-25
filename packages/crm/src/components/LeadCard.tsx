"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface LeadCardProps {
  id: string;
  item: any;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function LeadCard({ id, item, children, className, activeClassName }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      item
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${className} ${isDragging ? activeClassName : ''}`}
      data-is-dragging={isDragging}
    >
      {children}
    </div>
  );
}
