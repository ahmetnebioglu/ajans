"use client";

import React from 'react';
import { DndContext, DragEndEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export interface KanbanBoardProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  className?: string;
}

export function KanbanBoard({ children, onDragEnd, className }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners} 
      onDragEnd={onDragEnd}
    >
      <div className={className}>
        {children}
      </div>
    </DndContext>
  );
}
