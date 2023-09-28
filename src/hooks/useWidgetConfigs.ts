import { IWidgetCard, WidgetConfigs } from '@/interface/widget'
import { useAppSelector } from './redux'


/**  获取全部的widgets*/
export default function useWidgetConfigs() {
  const widgetConfigs = useAppSelector((state) => state.widgetConfigs.configs)
  const cards:WidgetConfigs[] = Object.values(widgetConfigs).filter((config: any) => !config.hideCard)

  const _cards: IWidgetCard[] = cards.map((config: WidgetConfigs) => {
    const {
      columns,
      detachFromLayout = false,
      displayName,
      iconSVG,
      key,
      rows,
      searchTags,
      type,
    } = config
    return {
      key,
      type,
      rows,
      columns,
      detachFromLayout,
      displayName,
      icon: iconSVG,
      searchTags,
    }
  })
  const sortedCards = _cards
  return sortedCards
}