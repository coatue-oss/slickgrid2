interface JQuery {
  antiscroll(options: {
    autoShow?: boolean
  }): JQuery

  drag: any

  sortable(options: any) // TODOCK
}

interface JQueryStatic {
  css: any
}

interface Antiscroll {
  destroy(): void
  refresh(): void
}
