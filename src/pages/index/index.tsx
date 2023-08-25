import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import LeftSidebar from '@/pages/leftSidebar'
import Editor from '@/pages/editor'
import RightSidebar from '@/pages/rightSidebar'
import { FrameSty } from './indexStyle'

export default function Index() {
  return (
    <FrameSty>
      <div style={{
        width: '180px'
      }}>
        <LeftSidebar />
      </div>
      <div style={{
        flex: '1',
        display: 'flex',
        justifyContent:"center"
      }}>
        <Editor />
      </div>
      <div style={{
        width: '180px'
      }}>
        <RightSidebar />
      </div>
    </FrameSty>
  )
}