//widget的初始值
import { WidgetConfigs } from '@/interface/widget'
import { createSlice } from '@reduxjs/toolkit'
const initialState: {
  configs: {
    [propName: string]: WidgetConfigs
  }
} = { configs: {} }

export const widgetConfigSlice = createSlice({
  name: 'widgetConfigSlice',
  initialState: initialState,
  reducers: {
    addWidgetConfig: (state, action) => {
      state.configs[action.payload.type] = action.payload
    }

  },
})

export const { addWidgetConfig } = widgetConfigSlice.actions

export default widgetConfigSlice.reducer