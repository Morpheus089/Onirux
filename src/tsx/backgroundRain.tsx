import React, { useEffect, useState } from 'react'
import '../css/backgroundRain.css'

interface Column {
  chars: string[]
  delay: number
  duration: number
  hue: number
}

const BackgroundRain: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([])

  const generateColumns = () => {
    const kanji = [
      '水','風','火','空','山','木','心','夢','愛','夜','光','闇','月','星',
      '日','雨','花','海','森','龍','虎','鳥','雲','雪','川','石','道','神',
      'あ','い','う','え','お','か','き','く','け','こ',
      'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト'
    ]

    const columnWidth = 24
    const columnCount = Math.ceil(window.innerWidth / columnWidth)
    const rowCount = Math.floor(window.innerHeight / 20) * 2

    const newCols: Column[] = Array.from({ length: columnCount }, () => {
      const delay = Math.random() * 5
      const duration = 10 + Math.random() * 10
      const hue = 120 + Math.random() * 40
      const chars = Array.from({ length: rowCount }, () =>
        kanji[Math.floor(Math.random() * kanji.length)]
      )
      return { chars, delay, duration, hue }
    })

    setColumns(newCols)
  }

  useEffect(() => {
    generateColumns()
    window.addEventListener('resize', generateColumns)
    return () => window.removeEventListener('resize', generateColumns)
  }, [])

  return (
    <div className="rain-container">
      {columns.map((col, i) => (
        <div
          key={i}
          className="rain-column"
          style={{
            animationDelay: `${col.delay}s`,
            animationDuration: `${col.duration}s`,
          }}
        >
          {col.chars.map((c, j) => (
            <span
              key={j}
              className="rain-char"
              style={{
                color: `hsl(${col.hue}, 100%, ${40 + Math.random() * 20}%)`,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default BackgroundRain