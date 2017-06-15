interface JQuery {
  antiscroll(options: {
    autoShow?: boolean
  }): JQuery

  drag: any

  sortable(options: any) // TODOCK
}

interface Antiscroll {
  destroy(): void
  refresh(): void
}
