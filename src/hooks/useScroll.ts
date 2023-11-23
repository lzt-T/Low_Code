
import { addContainerRows, isDraggingSelector, isResizingSelector } from '@/store/slices/dragResize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { ADD_ROW_BOUNDARY, SCROLL_INTERVAL, SCROLL_SPEED } from '@/constant/canvas';
import { ScrollDirection } from '@/enum/move';

export enum ScrollStatus {
  START = 'START',
  SCROLLING = 'SCROLLING',
  END = 'END'
}

type UseScrollProps = {
  scrollParent: any
  canvasId: string

}

export default function useScroll(props: UseScrollProps) {

  let { scrollParent, canvasId } = props
  const dispatch = useAppDispatch()
  const isResizing = useAppSelector(isResizingSelector)
  const isDragging = useAppSelector(isDraggingSelector)
  const lastTime = useRef(performance.now());
  const [scrollStatus, setScrollStatus] = useState<ScrollStatus>();
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(ScrollDirection.NONE);
  const scrollAnimation = useRef<any>();


  const changeScrollDirection = useCallback((direction: ScrollDirection) => {
    if (direction === ScrollDirection.UNCHANGED) {
      return
    }
    setScrollDirection(direction)
  }, [])


  /** 自动滚动*/
  const smoothScrollTo = () => {
    if (!scrollParent) {
      return
    }

    if (scrollParent.scrollTop === 0 && scrollDirection === ScrollDirection.TOP) {
      setScrollStatus(ScrollStatus.END)
      return
    }

    if (scrollDirection === ScrollDirection.BOTTOM && scrollParent.scrollTop + scrollParent.clientHeight >= scrollParent.scrollHeight - ADD_ROW_BOUNDARY) {
      dispatch(addContainerRows({
        canvasId: canvasId,
      }))
    }

    if (scrollDirection === ScrollDirection.NONE) {
      return
    }

    let currentTime = performance.now();
    let resultTop;
    if (scrollDirection === ScrollDirection.TOP) {
      resultTop = - SCROLL_SPEED
    }
    if (scrollDirection === ScrollDirection.BOTTOM) {
      resultTop = SCROLL_SPEED
    }
    if (currentTime - lastTime.current > SCROLL_INTERVAL) {
      scrollParent.scrollBy({
        top: resultTop, //负数向上滚动，正数向下滚动
        behavior: "smooth",
      })
      lastTime.current = currentTime
    }
    scrollAnimation.current = requestAnimationFrame(smoothScrollTo)
  }

  useEffect(() => {
    if (!isDragging || !isResizing) {
      setScrollStatus(ScrollStatus.END)
    }
  }, [isDragging, isResizing])


  useEffect(() => {
    if (scrollStatus === ScrollStatus.END) {
      cancelAnimationFrame(scrollAnimation.current)
      return
    }

    if (ScrollStatus.START) {
      smoothScrollTo()
    }

  }, [scrollStatus])


  return {
    setScrollStatus,
    smoothScrollTo,
    changeScrollDirection
  }
}