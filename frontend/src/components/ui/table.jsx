"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const TableContext = React.createContext({
  truncate: false,
  maxCellWidth: undefined,
  compact: false,
  layout: "auto"
})

function Table({
  className,
  truncate = false,
  maxCellWidth,
  compact = false,
  layout = "auto",
  containerClassName,
  ...props
}) {
  const ctx = React.useMemo(
    () => ({
      truncate: Boolean(truncate),
      maxCellWidth,
      compact: Boolean(compact),
      layout: layout === "fixed" ? "fixed" : "auto"
    }),
    [truncate, maxCellWidth, compact, layout]
  )

  return (
    <TableContext.Provider value={ctx}>
      <div
        data-slot="table-container"
        className={cn("relative w-full overflow-x-auto", containerClassName)}>
        <table
          data-slot="table"
          className={cn(
            "caption-bottom text-xs",
            ctx.layout === "fixed" ? "w-full table-fixed" : "w-max min-w-full",
            ctx.compact && "**:data-[slot=table-head]:h-8 **:data-[slot=table-cell]:py-1",
            className
          )}
          {...props} />
      </div>
    </TableContext.Provider>
  )
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props} />
  )
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  )
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props} />
  )
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props} />
  )
}

function truncateTitle(children, title) {
  if (title != null && title !== "") return String(title)
  if (children == null || children === false) return undefined
  if (typeof children === "string" || typeof children === "number") return String(children)
  return undefined
}

function colSizeStyle(width, truncate, layout) {
  if (width == null) return undefined
  const px = typeof width === "number" ? `${width}px` : width
  if (!truncate) return { maxWidth: px, width: px }
  // Truncate: min-width keeps columns readable; avoid fixed width (causes header overlap).
  if (layout === "fixed") {
    return { width: px, maxWidth: px, minWidth: px }
  }
  return { minWidth: px, maxWidth: px }
}

function TableHead({
  className,
  truncate: truncateProp,
  maxWidth,
  title,
  children,
  ...props
}) {
  const ctx = React.useContext(TableContext)
  const truncate = truncateProp ?? ctx.truncate
  const width = maxWidth ?? ctx.maxCellWidth
  const tip = truncateTitle(children, title)

  return (
    <th
      data-slot="table-head"
      title={truncate ? tip : title}
      style={colSizeStyle(width, truncate, ctx.layout)}
      className={cn(
        "h-9 px-2 text-left align-middle text-xs font-medium text-foreground [&:has([role=checkbox])]:pr-0",
        truncate ? "max-w-0 overflow-hidden text-ellipsis" : "whitespace-nowrap",
        className
      )}
      {...props}>
      {truncate ? (
        <span className="block min-w-0 truncate whitespace-nowrap">{children}</span>
      ) : (
        children
      )}
    </th>
  )
}

function TableCell({
  className,
  truncate: truncateProp,
  maxWidth,
  title,
  children,
  ...props
}) {
  const ctx = React.useContext(TableContext)
  const truncate = truncateProp ?? ctx.truncate
  const width = maxWidth ?? ctx.maxCellWidth
  const tip = truncateTitle(children, title)

  return (
    <td
      data-slot="table-cell"
      title={truncate ? tip : title}
      style={colSizeStyle(width, truncate, ctx.layout)}
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0",
        truncate ? "max-w-0 overflow-hidden text-ellipsis" : "whitespace-nowrap",
        className
      )}
      {...props}>
      {truncate ? (
        <span className="block min-w-0 truncate whitespace-nowrap">{children}</span>
      ) : (
        children
      )}
    </td>
  )
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props} />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
