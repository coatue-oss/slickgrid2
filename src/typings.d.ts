// TODOCK: fix 'any' types in here

interface JQuery {
  antiscroll(options: {
    autoShow?: boolean
  }): JQuery

  drag: any
}

interface JQueryStatic {
  css: any
}

interface Antiscroll {
  destroy(): void
  refresh(): void
}
