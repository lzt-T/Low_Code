import { useAppSelector } from '@/hooks/redux'
import useCanvasDragging from '@/hooks/useCanvasDragging';
import { isDraggingSelector, isResizingSelector } from '@/store/slices/dragResize'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { CanvasSliderSty } from './style';
import { getNearestParentCanvas } from '@/utils/helpers';

export interface CanvasDraggingArenaProps {
  /** 画布单位宽度*/
  snapColumnSpace: number;
  /** 画布单位高度*/
  snapRowSpace: number;
  /** 画布widgetId*/
  widgetId: string;
  /**  父亲id*/
  parentId: string | undefined;
}

export default function CanvasDraggingArena(props: CanvasDraggingArenaProps) {

  const { snapColumnSpace, snapRowSpace, widgetId, parentId } = props


  /** 是否调整大小*/
  const isResizing = useAppSelector(isResizingSelector)
  /** 是否拖拽*/
  const isDragging = useAppSelector(isDraggingSelector)

  /** canvas的高度*/
  const [canvasHeight, setCanvasHeight] = useState(0);
  /** canvas的宽度*/
  const [canvasWidth, setCanvasWidth] = useState(0);


  /** 监听是否在视口*/
  const interSectionObserver = useRef(
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        updateCanvasStylesIntersection(entry)
      })
    }),
  )

  /** 监听大小变化*/
  const resizeObserver = useRef(new ResizeObserver(() => {

  }))

  /** 画板*/
  const stickyCanvasRef = useRef<any>(null);
  /** canvas框*/
  const slidingArenaRef = useRef<any>(null);

  useCanvasDragging(slidingArenaRef, stickyCanvasRef, {
    widgetId,
    snapColumnSpace,
    snapRowSpace,
    parentId
  })


  /** 是否显示画布*/
  const showCanvas = useMemo(() => {
    return !!isDragging
  }, [isDragging])


  /**
  * 更新canvas样式
  * @param entry
  */
  const updateCanvasStylesIntersection = (
    entry: IntersectionObserverEntry,
  ) => {
    if (slidingArenaRef.current) {
      repositionSliderCanvas(entry)
    }
  }

  /**
  * @description 设置canvas的大小，及位置
  * @param entry
  * @returns
  */
  const repositionSliderCanvas = (entry: IntersectionObserverEntry) => {
    stickyCanvasRef.current.style.top = 0 + "px"
    stickyCanvasRef.current.style.left = 0 + "px"

    let boundingClientRect = slidingArenaRef.current.getBoundingClientRect()

    setCanvasHeight(boundingClientRect.height)
    setCanvasWidth(boundingClientRect.width)
  }

  /** 当显示时，设置canvas*/
  useEffect(() => {
    interSectionObserver.current.disconnect()
    slidingArenaRef.current && interSectionObserver.current.observe(slidingArenaRef.current)
  }, [showCanvas])

  useEffect(() => {
    if (slidingArenaRef.current === null) {
      return
    }
    resizeObserver.current.observe(slidingArenaRef.current)
    return () => {
      resizeObserver.current.disconnect()
    }
  }, [])

  return (
    <>
      {
        showCanvas ?
          (
            <>
              {/* 画布实际大小 */}
              <canvas ref={stickyCanvasRef}
                style={{
                  position: 'absolute',
                }}
                height={canvasHeight}
                width={canvasWidth}
              />
              {/* 画布实际大小 */}
              <CanvasSliderSty ref={slidingArenaRef} />
            </>
          )
          : null
      }
    </>
  )
}