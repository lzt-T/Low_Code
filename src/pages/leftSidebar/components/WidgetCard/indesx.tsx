import { useState, useEffect, useRef, useMemo, useCallback } from 'react'


interface WidgetCardProps {
  details: any
}

export default function WidgetCard(props: WidgetCardProps) {
  const { icon, displayName } = props.details

  console.log(props.details);
  
  return (
    <>
      <div style={{
        height:'200px'

      }}>
        <img src={icon} alt={''} />
        <div>{displayName}</div>
      </div>
    </>
  )
}