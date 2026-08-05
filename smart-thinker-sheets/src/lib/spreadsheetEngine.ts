export interface CellData {
  value: string
  formula?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  textColor?: string
  bgColor?: string
  align?: 'left' | 'center' | 'right'
  numberFormat?: 'general' | 'number' | 'currency' | 'percent'
}

export interface Sheet {
  id: string
  name: string
  data: Record<string, CellData>
  colWidths: Record<number, number>
  rowHeights: Record<number, number>
}

const NUM_ROWS = 100
const NUM_COLS = 26

export function createEmptySheet(name: string): Sheet {
  return {
    id: `sheet-${Date.now()}`,
    name,
    data: {},
    colWidths: {},
    rowHeights: {},
  }
}

export function getCellKey(row: number, col: number): string {
  return `${getColLetter(col)}${row + 1}`
}

export function getColLetter(col: number): string {
  let result = ''
  let c = col
  while (c >= 0) {
    result = String.fromCharCode(65 + (c % 26)) + result
    c = Math.floor(c / 26) - 1
  }
  return result
}

export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const colStr = match[1]
  const row = parseInt(match[2]) - 1
  let col = 0
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64)
  }
  col -= 1
  return { row, col }
}

function getCellNumericValue(key: string, data: Record<string, CellData>): number {
  const cell = data[key]
  if (!cell) return 0
  const val = cell.formula ? evaluateFormula(cell.formula, data) : cell.value
  const num = parseFloat(val)
  return isNaN(num) ? 0 : num
}

function expandRange(range: string): string[] {
  const parts = range.split(':')
  if (parts.length !== 2) return [range]
  const start = parseCellRef(parts[0].trim())
  const end = parseCellRef(parts[1].trim())
  if (!start || !end) return [range]

  const cells: string[] = []
  const minRow = Math.min(start.row, end.row)
  const maxRow = Math.max(start.row, end.row)
  const minCol = Math.min(start.col, end.col)
  const maxCol = Math.max(start.col, end.col)

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push(getCellKey(r, c))
    }
  }
  return cells
}

function getArguments(argsStr: string): string[] {
  const args: string[] = []
  let depth = 0
  let current = ''
  for (const char of argsStr) {
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      args.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) args.push(current.trim())
  return args
}

export function evaluateFormula(formula: string, data: Record<string, CellData>): string {
  try {
    const expr = formula.startsWith('=') ? formula.substring(1) : formula

    // SUM(range)
    const sumMatch = expr.match(/^SUM\((.+)\)$/i)
    if (sumMatch) {
      const cells = expandRange(sumMatch[1])
      const sum = cells.reduce((acc, key) => acc + getCellNumericValue(key, data), 0)
      return String(sum)
    }

    // AVERAGE(range)
    const avgMatch = expr.match(/^AVERAGE\((.+)\)$/i)
    if (avgMatch) {
      const cells = expandRange(avgMatch[1])
      const values = cells.map((key) => getCellNumericValue(key, data))
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return String(isNaN(avg) ? 0 : Math.round(avg * 100) / 100)
    }

    // COUNT(range)
    const countMatch = expr.match(/^COUNT\((.+)\)$/i)
    if (countMatch) {
      const cells = expandRange(countMatch[1])
      const count = cells.filter((key) => {
        const cell = data[key]
        return cell && cell.value !== '' && !isNaN(parseFloat(cell.value))
      }).length
      return String(count)
    }

    // MAX(range)
    const maxMatch = expr.match(/^MAX\((.+)\)$/i)
    if (maxMatch) {
      const cells = expandRange(maxMatch[1])
      const values = cells.map((key) => getCellNumericValue(key, data))
      return String(Math.max(...values))
    }

    // MIN(range)
    const minMatch = expr.match(/^MIN\((.+)\)$/i)
    if (minMatch) {
      const cells = expandRange(minMatch[1])
      const values = cells.map((key) => getCellNumericValue(key, data))
      return String(Math.min(...values))
    }

    // IF(condition, trueVal, falseVal)
    const ifMatch = expr.match(/^IF\((.+)\)$/i)
    if (ifMatch) {
      const args = getArguments(ifMatch[1])
      if (args.length === 3) {
        const condition = evaluateSimpleExpression(args[0], data)
        if (condition) {
          return args[1].replace(/"/g, '')
        } else {
          return args[2].replace(/"/g, '')
        }
      }
    }

    // CONCAT(values...)
    const concatMatch = expr.match(/^CONCAT\((.+)\)$/i)
    if (concatMatch) {
      const args = getArguments(concatMatch[1])
      return args.map((arg) => {
        const clean = arg.replace(/"/g, '')
        const ref = parseCellRef(clean)
        if (ref) return data[getCellKey(ref.row, ref.col)]?.value || ''
        return clean
      }).join('')
    }

    // Simple arithmetic with cell references
    return evaluateSimpleExpression(expr, data)
  } catch {
    return '#ERROR!'
  }
}

function evaluateSimpleExpression(expr: string, data: Record<string, CellData>): string {
  // Replace cell references with values
  let resolved = expr.replace(/[A-Z]+\d+/g, (match) => {
    const ref = parseCellRef(match)
    if (!ref) return match
    const key = getCellKey(ref.row, ref.col)
    const cell = data[key]
    if (!cell) return '0'
    if (cell.formula) return evaluateFormula(cell.formula, data)
    const num = parseFloat(cell.value)
    return isNaN(num) ? '0' : String(num)
  })

  // Remove quotes for string comparisons
  resolved = resolved.replace(/"/g, '')

  // Try to evaluate comparison operators
  const compMatch = resolved.match(/^(.+?)(>=|<=|!=|<>|>|<|=)(.+)$/)
  if (compMatch) {
    const left = parseFloat(compMatch[1])
    const op = compMatch[2]
    const right = parseFloat(compMatch[3])
    switch (op) {
      case '>': return String(left > right)
      case '<': return String(left < right)
      case '>=': return String(left >= right)
      case '<=': return String(left <= right)
      case '=': return String(left === right)
      case '!=': case '<>': return String(left !== right)
    }
  }

  // Try math evaluation (safe: only numbers and operators)
  if (/^[\d\s+\-*/().]+$/.test(resolved)) {
    try {
      const result = Function(`"use strict"; return (${resolved})`)()
      if (typeof result === 'number') {
        return String(Math.round(result * 1000000) / 1000000)
      }
    } catch {}
  }

  return resolved
}

export function getDisplayValue(key: string, sheet: Sheet): string {
  const cell = sheet.data[key]
  if (!cell) return ''
  if (cell.formula) return evaluateFormula(cell.formula, sheet.data)
  return cell.value
}

export { NUM_ROWS, NUM_COLS }
