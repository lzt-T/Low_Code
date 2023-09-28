export const getAbsolutePixels = (size?: string | null) => {
  if (!size) return 0
  const _dex = size.indexOf("px")
  if (_dex === -1) return 0
  return parseInt(size.slice(0, _dex), 10)
}


/**
 * 获取最近的父容器部件
 * @param el
 */
export const getNearestParentCanvas = (el: Element | null) => {
  const canvasQuerySelector = `.scrollElement`
  if (el) return el.closest(canvasQuerySelector)
  return null
}
