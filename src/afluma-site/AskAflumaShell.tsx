import AskAflumaClient from './AskAflumaClient'


export default function AskAflumaShell() {

  const publicEnabled =
    process.env
      .ASK_AFLUMA_ENABLED
      ?.trim()
      .toLowerCase() ===
        'true'


  const previewEnabled =
    process.env.NODE_ENV !==
      'production' &&
    process.env
      .ASK_AFLUMA_PREVIEW_ENABLED
      ?.trim()
      .toLowerCase() ===
        'true'


  if (
    !publicEnabled &&
    !previewEnabled
  ) {

    return null

  }


  return (
    <AskAflumaClient
      endpoint={
        publicEnabled
          ? '/api/ask-afluma'
          : '/api/ask-afluma-preview'
      }
      preview={
        !publicEnabled
      }
    />
  )
}