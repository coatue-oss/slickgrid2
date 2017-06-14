interface JQuery {
  antiscroll(options: {
    autoShow?: boolean
  }): JQuery

  sortable(options: any) // TODOCK
}

interface Antiscroll {
  destroy(): void
  refresh(): void
}
