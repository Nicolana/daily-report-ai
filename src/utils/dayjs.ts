import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// 设置语言
dayjs.locale('zh-cn')

// 加载插件
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY年MM月DD日 dddd')
}

export const formatDateSimple = (date: string | Date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

export const getCurrentWeek = () => {
  return dayjs().week()
}

export const getCurrentMonth = () => {
  return dayjs().month() + 1
}

export const getDaysUntilWeekend = () => {
  const today = dayjs().day()
  return today === 0 || today === 6 ? 0 : 6 - today
}

export const getWeekRange = () => {
  const start = dayjs().startOf('week').add(1, 'day') // 从周一开始
  const end = dayjs().endOf('week').add(1, 'day')     // 到周日结束
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  }
}

export const getMonthRange = () => {
  const start = dayjs().startOf('month')
  const end = dayjs().endOf('month')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  }
}

export default dayjs 