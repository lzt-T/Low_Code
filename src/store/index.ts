import { combineReducers, configureStore } from '@reduxjs/toolkit'
import widgetConfigReducer from './slices/widgetConfigSlice'
import canvasWidgetsStructureReducer from './slices/canvasWidgetsStructureSlice'
import mainCanvasReducer from './slices/mainCanvasSlice'
import canvasWidgetsReducer from './slices/canvasWidgets'
import dragResizeReducer from "./slices/dragResize"


const uiReducer = combineReducers({
  dragResize: dragResizeReducer,
  mainCanvas: mainCanvasReducer,
})


const store = configureStore({
  reducer: {
    widgetConfigs: widgetConfigReducer,
    canvasWidgetsStructure: canvasWidgetsStructureReducer,
    canvasWidgets: canvasWidgetsReducer,
    ui: uiReducer,
  },
})

//固定写法
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store