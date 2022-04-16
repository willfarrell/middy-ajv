import { createError } from '@middy/util'

const defaults = {
  eventSchema: undefined,
  contextSchema: undefined,
  responseSchema: undefined,
  defaultLanguage: 'en',
  availableLanguages: undefined // { 'en': require('ajv-i18n/localize/en') }
}

const ajvMiddleware = (opts = {}) => {
  const {
    eventSchema,
    contextSchema,
    responseSchema,
    defaultLanguage,
    availableLanguages
  } = { ...defaults, ...opts }
  const ajvLanguages = availableLanguages ? Object.keys(availableLanguages) : null
  const normalizePreferredLanguage = (lang) => languageNormalizationMap[lang] ?? lang.split('-')[0]
  const chooseLanguage = ({ preferredLanguage }) => {
    if (preferredLanguage) {
      const lang = normalizePreferredLanguage(preferredLanguage)
      if (ajvLanguages.includes(lang)) {
        return lang
      }
    }

    return defaultLanguage
  }

  const ajvMiddlewareBefore = async (request) => {
    if (eventSchema) {
      const eventValid = eventSchema(request.event)

      if (!eventValid) {
        const error = createError(400, 'Event object failed validation')

        if (availableLanguages) {
          const language = chooseLanguage(request.event)
          availableLanguages[language](eventSchema.errors)
        }

        error.cause = eventSchema.errors
        throw error
      }
    }
    if (contextSchema) {
      const contextValid = contextSchema(request.context)

      if (!contextValid) {
        const error = createError(500, 'Context object failed validation')
        error.cause = contextSchema.errors
        throw error
      }
    }
  }

  const ajvMiddlewareAfter = async (request) => {
    const responseValid = responseSchema(request.response)

    if (!responseValid) {
      const error = createError(500, 'Response object failed validation')
      error.cause = responseSchema.errors
      throw error
    }
  }
  return {
    before: eventSchema ?? contextSchema ? ajvMiddlewareBefore : undefined,
    after: responseSchema ? ajvMiddlewareAfter : undefined
  }
}

/* ajv-i18n mapping */
const languageNormalizationMap = {
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  pt_BR: 'pt-BR',
  pt_br: 'pt-BR',
  'zh-tw': 'zh-TW',
  zh_TW: 'zh-TW',
  zh_tw: 'zh-TW'
}

export default ajvMiddleware
