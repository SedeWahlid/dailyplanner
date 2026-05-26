import { RRule, rrulestr } from 'rrule'

export function parseRecurrenceRule(ruleStr: string | null): RRule | null {
  if (!ruleStr) return null
  try {
    const rule = rrulestr(ruleStr)
    if (!(rule instanceof RRule)) return null
    return rule
  } catch {
    return null
  }
}

export function getNextOccurrence(ruleStr: string | null, afterDate: Date = new Date()): Date | null {
  const rule = parseRecurrenceRule(ruleStr)
  if (!rule) return null
  return rule.after(afterDate, true) ?? null
}

export function generateRecurrenceRule(freq: string, interval = 1, byweekday?: number[]): string {
  const rruleFreq = RRule[freq.toUpperCase() as keyof typeof RRule]
  const options: { freq: number; interval: number; byweekday?: number[] } = {
    freq: rruleFreq as unknown as number,
    interval,
  }
  if (byweekday?.length) {
    options.byweekday = byweekday
  }
  const rule = new RRule(options)
  return rule.toString()
}

export function getFrequencyLabel(freq: string): string {
  const labels: Record<string, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
  }
  return labels[freq] || freq
}
