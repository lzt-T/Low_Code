import React, { useEffect } from "react"
import { useMemo } from 'react'


interface MdButtonProps {
  [propName: string]: any
}
export default function MdButton(props: MdButtonProps) {
  const {
    text
  } = props

  
  return (
    <>
      <div style={{
        height: '100%',
        width:'100%',
        background: 'red',
        overflow:'hidden'
      }}>{text}</div>
    </>
  )
}
