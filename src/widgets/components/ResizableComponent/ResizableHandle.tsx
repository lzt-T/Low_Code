import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDrag } from "@use-gesture/react"

interface ResizableHandleProps {
  Component: any,
  onStart: () => void,
  onStop: () => void
}

export default function ResizableHandle(props: ResizableHandleProps) {
  const { Component, onStart = () => { },onStop=()=>{}} = props

  const bind = useDrag((state: any) => {
    const {
      first,
      last,
      dragging,
      //记录数据
      memo,
      //mx表示在轴上移动的距离，my表示在y轴上移动的距离
      movement: [mx, my],
    } = state


    if (first) {
      onStart()
    }

    if (last) {
      props.onStop()
    }
  })
  return (
    <>
      <Component {...bind()} ></Component>
    </>
  )
}