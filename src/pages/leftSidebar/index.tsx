import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { registerWidgets } from '@/utils/WidgetRegistry'
import useWidgetConfigs from '@/hooks/useWidgetConfigs'
import WidgetCard from './components/WidgetCard/indesx'
import { useAppSelector } from '@/hooks/redux'

export default function LeftSidebar() {
  const configs = useWidgetConfigs()

  useEffect(() => {
    registerWidgets()
  },[])

  return (
    <>
      <div>左侧</div>
      <div>
        {
          configs.map((card: any, ind: number) => {
            return (
              <WidgetCard details={card} key={ind} />
            )
          })
        }
      </div>
    </>
  )
}