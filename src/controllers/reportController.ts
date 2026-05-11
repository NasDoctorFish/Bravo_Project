// src/controllers/reportController.ts
import { supabase } from '../lib/supabaseClient'

export type PeriodType = 'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

export type Report = {
  reportid?: number
  targetid: string
  targettype: string
  periodtype: PeriodType
  startdate: string
  enddate: string
  reportsummary: string
  reportcontent: string
  created_at?: string
}

export type ActivityViewLog = {
  activityid: number
  targetid: number
  targetname: string
  timestamp: string
  userid: number
  source: number
  referraldata: string
  eventtype: string
}

// Generate Monthly Report Data
export type ReportChartPoint = {
  period: string
  totalLogs: number
  totalViews: number
  totalClicks: number
  uniqueUsers: number
}

// For Chart
export type ReportResult = {
  report: Report
  chartData: ReportChartPoint[]
}


/**
 * Generate key and values lists based on periodType 'DAILY', 'MONTHLY', 'YEARLY'
 * return string
 */
function getPeriodKey(timestamp: string, periodType: PeriodType): string {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (periodType === 'DAILY') {
    return `${year}-${month}-${day}`
  }

  if (periodType === 'MONTHLY') {
    return `${year}-${month}`
  }

  if (periodType === 'YEARLY') {
    return `${year}`
  }

  return `${year}-${month}-${day}`
}

/**
 * Generate Chart Date based on activity data and periodType
 * return ReportChartPoint List
 */
export function generateChartData(
  activityData: ActivityViewLog[],
  periodType: PeriodType
): ReportChartPoint[] {
  const groupedData = new Map<string, ActivityViewLog[]>()

  for (const log of activityData) {
    const periodKey = getPeriodKey(log.timestamp, periodType)

    if (!groupedData.has(periodKey)) {
      groupedData.set(periodKey, [])
    }

    groupedData.get(periodKey)!.push(log)
  }

  const chartData: ReportChartPoint[] = []

  for (const [period, logs] of groupedData.entries()) {
    const totalLogs = logs.length

    const totalViews = logs.filter(
      (log) => log.eventtype === 'VIEW'
    ).length

    const totalClicks = logs.filter(
      (log) => log.eventtype === 'CLICK'
    ).length

    const uniqueUsers = new Set(
      logs.map((log) => log.userid)
    ).size

    chartData.push({
      period,
      totalLogs,
      totalViews,
      totalClicks,
      uniqueUsers
    })
  }

  chartData.sort((a, b) => a.period.localeCompare(b.period))

  return chartData
}


/**
 * verify if the start_date and end_date format is invalid
 * return boolean
 */
export function verifyReportAvailability(start_date: string, end_date: string): boolean {
    // convert string into datetime
    const startDateText = start_date.trim()
    const endDateText = end_date.trim()

    const startDateTime = new Date(startDateText)
    const endDateTime = new Date(endDateText)

    // 1. Check date
    if (Number.isNaN(startDateTime.getTime())) {
        return false
    }

    if (Number.isNaN(endDateTime.getTime())) {
        return false
    }

    // 2. check if start date is less than end date
    if (startDateTime > endDateTime) {
        return false
    }
    
    return true
}


/**
 * format date to YYYY-MM-DD
 * return string
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


/**
 * retrieve ActivityViewLog Data from startDate to endDate
 * Accessed from Supabase DB and returns ActivityViewLog[] format
 */

export async function retrieveActivityData(
  startDate: Date,
  endDate: Date,
  targetId: string,
  targetType: string
): Promise<ActivityViewLog[]> {
  const startDateText = formatDateToYYYYMMDD(startDate)
  const endDateText = formatDateToYYYYMMDD(endDate)

  let query = supabase
    .from('activityviewlog')
    .select('*')
    .gte('timestamp', startDateText)
    .lte('timestamp', endDateText)

  if (targetType !== 'platform') {
    query = query.eq('targetid', Number(targetId))
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data as ActivityViewLog[]
}



// =========++++++++===============+++++++++========+++++++======++++++++=====++++++++======++++++++======


/**
 * Generate report data and return Report type data
 */
export async function generateReportData(
  start_date: string,
  end_date: string,
  periodType: PeriodType,
  targetId: string,
  targetType: string
): Promise<ReportResult> {
  const startDateText = start_date.trim()
  const endDateText = end_date.trim()
  const cleanTargetId = targetId.trim()
  const cleanTargetType = targetType.trim()

  const startDate = new Date(startDateText)
  const endDate = new Date(endDateText)

  if (!verifyReportAvailability(startDateText, endDateText)) {
    throw new Error('Invalid report date range')
  }

  if (!periodType) {
    throw new Error('No periodType given.')
  }

  if (!cleanTargetId) {
    throw new Error('No targetId given')
  }

  if (!cleanTargetType) {
    throw new Error('No targetType given')
  }

  const activityData = await retrieveActivityData(
    startDate,
    endDate,
    cleanTargetId,
    cleanTargetType
  )

  const chartData = generateChartData(activityData, periodType)
  const reportSummary = generateReportSummary(activityData)

  const reportContent = `
Fundraising Platform Report

Period Type: ${periodType}
Target ID: ${cleanTargetId}
Target Type: ${cleanTargetType}
Start Date: ${startDateText}
End Date: ${endDateText}

${reportSummary}
  `.trim()

  const reportData = {
    targetid: cleanTargetId,
    targettype: cleanTargetType,
    periodtype: periodType,
    startdate: startDateText,
    enddate: endDateText,
    reportsummary: reportSummary,
    reportcontent: reportContent,
    chartdata: chartData
  }

  const { data, error } = await supabase
    .from('report')
    .insert([reportData])
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    report: data as Report,
    chartData
  }
}


/**
 * Return report summary
 */
export function generateReportSummary(
  activityData: ActivityViewLog[]
): string {
  const totalLogs = activityData.length

  const totalViews = activityData.filter(
    (log) => log.eventtype === 'VIEW'
  ).length

  const totalClicks = activityData.filter(
    (log) => log.eventtype === 'CLICK'
  ).length

  const uniqueUsers = new Set(
    activityData.map((log) => log.userid)
  ).size

  return `
Report Summary

Total Activity Logs: ${totalLogs}
Total Views: ${totalViews}
Total Clicks: ${totalClicks}
Unique Users: ${uniqueUsers}
  `.trim()
}