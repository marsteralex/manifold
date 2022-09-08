import { ResponsiveLine } from '@nivo/line'
import { PortfolioMetrics } from 'common/user'
import { formatMoney } from 'common/util/format'
import { last } from 'lodash'
import { memo } from 'react'
import { useWindowSize } from 'web/hooks/use-window-size'
import { formatTime } from 'web/lib/util/time'

export const PortfolioValueGraph = memo(function PortfolioValueGraph(props: {
  portfolioHistory: PortfolioMetrics[]
  mode: 'value' | 'profit'
  height?: number
  includeTime?: boolean
}) {
  const { portfolioHistory, height, includeTime, mode } = props
  const { width } = useWindowSize()

  const points = portfolioHistory.map((p) => {
    const { timestamp, balance, investmentValue, totalDeposits } = p
    const value = balance + investmentValue
    const profit = value - totalDeposits

    return {
      x: new Date(timestamp),
      y: mode === 'value' ? value : profit,
    }
  })
  const data = [{ id: 'Value', data: points, color: '#11b981' }]
  const numXTickValues = !width || width < 800 ? 2 : 5
  const numYTickValues = 4
  const endDate = last(points)?.x
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: height ?? (!width || width >= 800 ? 350 : 250) }}
    >
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 28, bottom: 22, left: 60 }}
        xScale={{
          type: 'time',
          min: points[0]?.x,
          max: endDate,
        }}
        yScale={{
          type: 'linear',
          stacked: false,
          min: Math.min(...points.map((p) => p.y)),
        }}
        gridYValues={numYTickValues}
        curve="stepAfter"
        enablePoints={false}
        colors={{ datum: 'color' }}
        axisBottom={{
          tickValues: numXTickValues,
          format: (time) => formatTime(+time, !!includeTime),
        }}
        pointBorderColor="#fff"
        pointSize={points.length > 100 ? 0 : 6}
        axisLeft={{
          tickValues: numYTickValues,
          format: (value) => formatMoney(value),
        }}
        enableGridX={!!width && width >= 800}
        enableGridY={true}
        enableSlices="x"
        animate={false}
        yFormat={(value) => formatMoney(+value)}
      ></ResponsiveLine>
    </div>
  )
})
