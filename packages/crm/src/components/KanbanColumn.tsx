"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export interface KanbanColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({ id, children, className }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef} 
      id={id}
      className={className}
      data-is-over={isOver}
    >
      {children}
    </div>
  );
}
