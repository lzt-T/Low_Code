import React, { useRef, ReactNode, RefObject, useMemo } from 'react'
import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas'
import useIsShowDragLayer from '@/hooks/useIsShowDragLayer'
import { addRowNumSelector } from '@/store/slices/dragResize'
import { useAppSelector } from '@/hooks/redux'
import { ContainerScrollSty, MainContainerSty, ContainerSty } from './style'

type ContainerComponentProps = {
  type: string
  widgetId: string
  topRow: number
  bottomRow: number
  leftColumn: number
  rightColumn: number
  parentRowSpace: number
  parentColumnSpace: number
  containRows?: number
  [propsName: string]: any
}

const ContainerComponent = (props: ContainerComponentProps) => {
  const { widgetId, topRow, bottomRow, parentRowSpace, type, containRows = 0 } = props
  const { isShowDragLayer } = useIsShowDragLayer(widgetId)
  const addRowNum = useAppSelector(addRowNumSelector(widgetId))

  let height = useMemo(() => {
    if (type === 'CANVAS_WIDGET') {
      return (bottomRow - topRow + addRowNum) * parentRowSpace
    }
    return (containRows + addRowNum)*parentRowSpace
  }, [topRow, bottomRow, parentRowSpace, addRowNum, widgetId, containRows])

  return widgetId === MAIN_CONTAINER_WIDGET_ID ? (
    <MainContainerSty
      $isShowDragLayer={isShowDragLayer}
      height={height}
    >
      {props.children}
    </MainContainerSty>
  ) : (
    <ContainerScrollSty
      className='scrollElement'
    >
      <ContainerSty
        height={height}
        $isShowDragLayer={isShowDragLayer}
      >
        {props.children}
      </ContainerSty>
    </ContainerScrollSty>
  )
}

ContainerComponent.displayName = 'ContainerComponent'

export default ContainerComponent
