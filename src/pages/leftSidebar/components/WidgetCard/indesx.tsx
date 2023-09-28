
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { WrapperSty } from './style'
import { useDispatch } from 'react-redux'
import { setNewWidgetDragging } from '@/store/slices/dragResize'
import { generateReactKey } from '@/utils/generators'
import { IWidgetCard } from '@/interface/widget'

interface WidgetCardProps {
  details: IWidgetCard
}

export default function WidgetCard(props: WidgetCardProps) {
  const { icon, displayName, type } = props.details
  const dispatch = useDispatch()

  const onDragStart: React.DragEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()

    dispatch(setNewWidgetDragging({
      isDragging: true,
      newWidgetProps: {
        ...props.details,
        widgetId: generateReactKey({ prefix: type })
      }
    }))
  }

  return (
    <>
      <WrapperSty
        style={{
          height: '100%',
        }}
        draggable="true"
        onDragStart={onDragStart}
      >
        <img src={icon} alt={''} />
        <div>{displayName}</div>
      </WrapperSty>
    </>
  )
}