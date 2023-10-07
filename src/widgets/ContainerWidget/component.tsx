import React, { useRef, ReactNode, RefObject } from 'react'
import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas'

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
  return widgetId === MAIN_CONTAINER_WIDGET_ID ? (
    <ContainerComponentWrapper {...props} />
  ) : (
    <div style={{
      boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
      height: '100%',
      backgroundColor: '#fff',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {props.children}
    </div>
  )
}

ContainerComponent.displayName = 'ContainerComponent'

export default ContainerComponent
