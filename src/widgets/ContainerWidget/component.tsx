import React, { useRef, ReactNode, RefObject, useMemo } from 'react'
import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas'
import useIsShowDragLayer from '@/hooks/useIsShowDragLayer'

function ContainerComponentWrapper(props: any) {
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
    >
      {props.children}
    </div>
  )
}

const ContainerComponent = (props: any) => {
  const { widgetId } = props
  const { isShowDragLayer } = useIsShowDragLayer(widgetId)
  
  return widgetId === MAIN_CONTAINER_WIDGET_ID ? (
    <ContainerComponentWrapper {...props} />
  ) : (
    <div
      className='scrollElement'
      style={{
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
        height: '100%',
        // backgroundColor: '#fff',
        overflowX: 'hidden',
        overflowY: 'scroll',
        position: 'relative',
      }}>
      <div
        style={{
          position: 'relative',
          height: '890px',
          backgroundColor: isShowDragLayer ? "transparent" : '#fff',
        }}>
        {props.children}
      </div>
    </div>
  )
}

ContainerComponent.displayName = 'ContainerComponent'

export default ContainerComponent
