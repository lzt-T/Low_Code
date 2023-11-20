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
  /** 准备移动,也就是点击了widget但是还没开始移动*/
  PREPARE_MOVE = 'PREPARE_MOVE',
  /** 在容器中移动*/
  MOVE = 'MOVE',
}

/** 枚举拖拽类型*/
export enum DraggingType { 
  /** 未知*/
  NONE = 'NONE',
  /** 新元素*/
  NEW_WIDGET = 'NEW_WIDGET',
  /** 现有元素*/
  EXISTING_WIDGET = 'EXISTING_WIDGET'
}