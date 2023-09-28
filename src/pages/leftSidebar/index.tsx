import { useEffect } from 'react'
import { registerWidgets } from '@/utils/WidgetRegistry'
import useWidgetConfigs from '@/hooks/useWidgetConfigs'
import WidgetCard from './components/WidgetCard/indesx'
import { IWidgetCard } from '@/interface/widget'
import {WrapperListSty} from './indexStyle'

export default function LeftSidebar() {
  const configs = useWidgetConfigs()

  useEffect(() => {
    registerWidgets()
  }, [])

  return (
    <>
      <div>左侧</div>
      <WrapperListSty>
        {
          configs.map((card: IWidgetCard, ind: number) => {
            return (
              <WidgetCard details={card} key={ind} />
            )
          })
        }
      </WrapperListSty>
    </>
  )
}