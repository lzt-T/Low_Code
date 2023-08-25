import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/store/index"
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas"

const initialState = {
  initialized: false,
  width: 375,
  height: 730,
  /* 左侧side宽度 */
  leftSideWidth: 300,
  /* 右侧side宽度 */
  rightSideWidth: 300
}

const mainCanvasSlice = createSlice({
  name: 'mainCanvas',
  initialState,
  reducers: {
    initCanvasLayout(state, action) {
      const mainCanvas =
        action.payload.widgets &&
        action.payload.widgets[MAIN_CONTAINER_WIDGET_ID]

      state.width = mainCanvas?.rightColumn || state.width
      state.height = mainCanvas?.leftColumn || state.height
    },
  }
})

export default mainCanvasSlice.reducer

/**
 * 获取画布宽高基础信息
 * @param state
 */
export const getMainCanvasProps = (state: RootState) => state.ui.mainCanvas