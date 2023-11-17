export enum ReflowDirection {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  TOP = "TOP",
  BOTTOM = "BOTTOM",
  TOPLEFT = "TOPLEFT",
  TOPRIGHT = "TOPRIGHT",
  BOTTOMLEFT = "BOTTOMLEFT",
  BOTTOMRIGHT = "BOTTOMRIGHT",
  UNSET = "UNSET",
}

export enum ReSizeDirection {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  TOP = "TOP",
  BOTTOM = "BOTTOM",
}

/** 拖拽的状态*/
export enum DraggingStatus {
  /** 无*/
  NONE = 'NONE',
  /** 离开容器*/
  GO_OUT = 'GO_OUT',
  /** 进入容器*/
  ENTER = 'ENTER',
  /** 在容器中移动*/
  MOVE = 'MOVE',
}