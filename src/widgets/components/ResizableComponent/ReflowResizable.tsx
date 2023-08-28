import React, { useCallback, useMemo, useRef } from "react"
import { get, omit } from "lodash"
import { WidgetProps } from "@/interface/widget"
import ResizeBorder from "./ResizeBorder"
import { WIDGET_PADDING } from "@/constant/widget"


interface ReflowResizableProps {
  topRow: number,
  bottomRow: number
  leftColumn: number,
  rightColumn: number,
  parentColumnSpace: number,
  parentRowSpace: number,
  enableResize: boolean,
  children: React.ReactNode,
  [propName: string]: any
}
export default function ReflowResizable(props: ReflowResizableProps) {
  const { enableResize, children, topRow, bottomRow, leftColumn,
    rightColumn, parentColumnSpace, parentRowSpace } = props
  const resizableRef = useRef<any>()

  /** widget大小*/
  const dimensions: any = useMemo(() => {
    let width = (rightColumn - leftColumn) * parentColumnSpace - 2 * WIDGET_PADDING;
    let height = (bottomRow - topRow) * parentRowSpace - 2 * WIDGET_PADDING;
    return {
      width,
      height
    }

  }, [topRow, bottomRow, leftColumn, rightColumn, parentColumnSpace, parentRowSpace])

  return (
    <div style={{ position: 'relative',width:'100%',height:'100%' }} ref={resizableRef}>
      {children}
      {enableResize && <ResizeBorder />}
    </div>
  )
}
