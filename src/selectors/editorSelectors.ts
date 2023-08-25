import { getMainCanvasProps } from "@/store/slices/mainCanvasSlice"
import { createSelector } from "@reduxjs/toolkit"

/** 获取画布宽度*/
export const getCanvasWidth = createSelector(getMainCanvasProps, (state) => { return state.width })