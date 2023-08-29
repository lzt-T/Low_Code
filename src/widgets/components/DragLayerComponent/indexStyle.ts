import { GridDefaults } from "@/constant/canvas";
import styled from "styled-components"

const GRID_POINT_SIZE = 1

export const WrappedDragLayerSty = styled.div<{
  $columnWidth: number;
  $rowHeight: number;
}>`
  position: absolute;
  top: -${GRID_POINT_SIZE }px;
  left: -${GRID_POINT_SIZE }px;
  pointer-events: none;
  height:100%;
  width:100%;
  background-image: radial-gradient(
    circle at ${GRID_POINT_SIZE}px ${GRID_POINT_SIZE}px,
    #ccc ${GRID_POINT_SIZE}px,
    transparent 0
  );
  background-size: ${(props) =>
    props.$columnWidth - GRID_POINT_SIZE / GridDefaults.DEFAULT_GRID_COLUMNS}px
    ${(props) => props.$rowHeight}px;
  
`