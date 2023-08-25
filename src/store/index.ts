import { configureStore } from '@reduxjs/toolkit'
import widgetConfigReducer from './slices/widgetConfigSlice'

const store = configureStore({
  reducer: {
    widgetConfigs: widgetConfigReducer,
  },
})

//固定写法
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store