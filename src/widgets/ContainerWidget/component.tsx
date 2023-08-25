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
    <div>{props.children}</div>
  )
}

ContainerComponent.displayName = 'ContainerComponent'

export default ContainerComponent
