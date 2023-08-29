import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { WrappedDragLayerSty } from './indexStyle';

interface DragLayerComponentProps {
  parentRowHeight: number;
  parentColumnWidth: number;
  [propName: string]: any
};
export default function DragLayerComponent(props: DragLayerComponentProps) {
  const { parentRowHeight, parentColumnWidth } = props;
  return (
    <WrappedDragLayerSty
      $columnWidth={parentColumnWidth}
      $rowHeight={parentRowHeight}
    />
  )
}