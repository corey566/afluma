export type AnyDoc = Record<string, any>

export type PageContext = {
  doc: AnyDoc
  kind: string
  related?: AnyDoc[]
  articles?: AnyDoc[]
  jobs?: AnyDoc[]
}

export type Action = {
  label: string
  href: string
  secondary?: boolean
}
