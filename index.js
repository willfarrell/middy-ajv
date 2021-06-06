const {createError} = require('@middy/util')

const defaults = {
  inputSchema: null,
  outputSchema: null,
  defaultLanguage: 'en',
  availableLanguages: undefined // { 'en': require('ajv-i18n').en }
}

const ajvMiddleware = (opts = {}) => {
  const {
    inputSchema,
    outputSchema,
    defaultLanguage,
    availableLanguages
  } = { ...defaults, ...opts }
  const ajvLanguages = availableLanguages ? Object.keys(availableLanguages) : null
  const normalizePreferredLanguage = (lang) => languageNormalizationMap[lang] ?? lang.split('-')[0]
  const chooseLanguage = ({ preferredLanguage }, defaultLanguage) => {
    if (preferredLanguage) {
      const lang = normalizePreferredLanguage(preferredLanguage)
      if (ajvLanguages.includes(lang)) {
        return lang
      }
    }

    return defaultLanguage
  }

  const ajvMiddlewareBefore = async (request) => {
    const valid = inputSchema(request.event)

    if (!valid) {
      const error = createError(400, 'Event object failed validation')
      request.event.headers = { ...request.event.headers }

      if (availableLanguages) {
        const language = chooseLanguage(request.event, defaultLanguage)
        availableLanguages[language](inputSchema.errors)
      }

      error.details = inputSchema.errors
      throw error
    }
  }

  const ajvMiddlewareAfter = async (request) => {
    const valid = outputSchema(request.response)

    if (!valid) {
      const error = createError(500, 'Response object failed validation')
      error.details = outputSchema.errors
      error.response = request.response
      throw error
    }
  }
  return {
    before: inputSchema ? ajvMiddlewareBefore : undefined,
    after: outputSchema ? ajvMiddlewareAfter : undefined
  }
}

/* ajv-i18n mapping */
const languageNormalizationMap = {
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  pt_BR: 'pt-BR',
  pt_br: 'pt-BR',
  zh: 'zh-TW',
  'zh-tw': 'zh-TW',
  zh_TW: 'zh-TW',
  zh_tw: 'zh-TW'
}

module.exports = ajvMiddleware