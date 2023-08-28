//调整大小边框
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  BottomBorderStyles,
  BottomLeftBorderStyles,
  BottomRightBorderStyles,
  LeftBorderStyles,
  RightBorderStyles,
  TopBorderStyles,
  TopLeftBorderStyles,
  TopRightBorderStyles
} from './ResizeableStyle'


interface ResizeBorderProps {

}

export default function ResizeBorder(props: ResizeBorderProps) {
  const [borderList, setBorderList] = useState([])
  const allBorders: Record<string, any> = useMemo(() => {
    return {
      leftBorderEle: LeftBorderStyles,
      topBorderEle: TopBorderStyles,
      bottomBorderEle: BottomBorderStyles,
      rightBorderEle: RightBorderStyles,
      topLeftBorderEle: TopLeftBorderStyles,
      topRightBorderEle: TopRightBorderStyles,
      bottomLeftBorderEle: BottomLeftBorderStyles,
      bottomRightBorderEle: BottomRightBorderStyles,
    }
  }, [])


  useEffect(() => {
    let list: any = [];
    if (allBorders.topBorderEle) {
      list.push({
        component: allBorders.topBorderEle,
      })
    }
    if (allBorders.bottomBorderEle) {
      list.push({
        component: allBorders.bottomBorderEle,
      })
    }
    if (allBorders.leftBorderEle) {
      list.push({
        component: allBorders.leftBorderEle,
      })
    }
    if (allBorders.rightBorderEle) {
      list.push({
        component: allBorders.rightBorderEle,
      })
    }
    if (allBorders.topLeftBorderEle) {
      list.push({
        component: allBorders.topLeftBorderEle,
      })
    }
    if (allBorders.topRightBorderEle) {
      list.push({
        component: allBorders.topRightBorderEle,
      })
    }
    if (allBorders.bottomLeftBorderEle) {
      list.push({
        component: allBorders.bottomLeftBorderEle,
      })
    }
    if (allBorders.bottomRightBorderEle) {
      list.push({
        component: allBorders.bottomRightBorderEle,
      })
    }

    setBorderList(list)
  }, [allBorders])

  return (
    <>
      {
        borderList.map((item: any, ind: number) => {
          return (
            <div key={ind}>
              <item.component />
            </div>
          )
        })
      }
    </>
  )
}