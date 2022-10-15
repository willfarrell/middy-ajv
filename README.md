# Middy AJV

<div align="center">
  <img alt="Middy logo" src="https://raw.githubusercontent.com/middyjs/middy/master/docs/img/middy-logo.svg"/>
</div>

<div align="center">
  <p><strong>AJV middleware for the middy framework, the stylish Node.js middleware engine for AWS Lambda</strong></p>
</div>

<div align="center">
<p>
  <a href="http://badge.fury.io/js/middy-ajv">
    <img src="https://badge.fury.io/js/middy-ajv.svg" alt="npm version" style="max-width:100%;">
  </a>
  <a href="https://snyk.io/test/github/willfarrell/middy-ajv">
    <img src="https://snyk.io/test/github/willfarrell/middy-ajv/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/willfarrell/middy-ajv" style="max-width:100%;">
  </a>
  <a href="https://standardjs.com/">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard Code Style"  style="max-width:100%;">
  </a>
  <a href="https://gitter.im/middyjs/Lobby">
    <img src="https://badges.gitter.im/gitterHQ/gitter.svg" alt="Chat on Gitter"  style="max-width:100%;">
  </a>
</p>
</div>

This middleware automatically validates incoming events and outgoing responses against custom
schemas defined with the [JSON schema syntax](http://json-schema.org/).

If an incoming event fails validation a `BadRequest` error is raised.
If an outgoing response fails validation a `InternalServerError` error is
raised.

This middleware can be used in combination with
[`httpErrorHandler`](#httperrorhandler) to automatically return the right
response to the user.

It can also be used in combination with [`httpcontentnegotiation`](#httpContentNegotiation) to load localised translations for the error messages (based on the currently requested language). This feature uses internally [`ajv-i18n`](http://npm.im/ajv-i18n) module, so reference to this module for options and more advanced use cases. By default the language used will be English (`en`), but you can redefine the default language by passing it in the `ajvOptions` options with the key `defaultLanguage` and specifying as value one of the [supported locales](https://www.npmjs.com/package/ajv-i18n#supported-locales).

Also, this middleware accepts an object with plugins to be applied to customize the internal `ajv` instance.

## Install

To install this middleware you can use NPM:

```bash
npm install --save middy-ajv
```

Requires: @middy/core:>=2.0.0


## Options

- `eventSchema` (function) (default `undefined`): The JSON schema compiled ajv validator that will be used
  to validate the input (`request.event`) of the Lambda handler.
- `contextSchema` (function) (default `undefined`): The JSON schema object or compiled ajv validator that will be used
  to validate the input (`request.context`) of the Lambda handler. Has additional support for `typeof` keyword to allow validation of `"typeof":"function"`.
- `responseSchema` (function) (default `undefined`): The JSON schema compiled ajv validator that will be used
  to validate the output (`request.response`) of the Lambda handler.
- `availableLanguages` (object) (optional): Error messages can be returned in multiple languages using [`ajv-i18n`](https://www.npmjs.com/package/ajv-i18n). Language is selected based on `event.preferredLanguage` set by `@middy/http-content-negotiation`. Should be in the format: `{ 'en': require('ajv-i18n/localize/en') }`.
- `defaultLanguage` (string) (default: `en`): The default language to use when `availableLanguages` is provided and `event.preferredLanguage` is not supported.

NOTES:
- At least one of `eventSchema` or `responseSchema` is required.

## Sample usage

Example for validation using precompiled schema:

```javascript
import middy from '@middy/core'
import validator from 'middy-ajv'

const handler = middy((event, context) => {
  return {}
})

const eventSchema = require('schema.js')

handler.use(validator({ eventSchema }))

// invokes the handler, note that property foo is missing
const event = {
  body: JSON.stringify({something: 'somethingelse'})
}
handler(event, {}, (err, res) => {
  t.is(err.message,'Event object failed validation')
})
```

## Build step

### Folder Structure
```shell
{project}
|-- handlers
| |-- {endpoint}
| | |-- index.js
| | |-- schema.event.json
| | |-- schema.context.json
| | |-- schema.response.json
```


### Install
```shell
$ npm install -D ajv-cli
```

### Run
```shell
# or write your own
npx middy-ajv
```

After the compile script has been run on the `endpoint` folder, it will contain `schema.event.js`, `schema.context.js`, `schema.response.js` and `index.js`.

## Middy documentation and examples

For more documentation and examples, refers to the main [Middy monorepo on GitHub](https://github.com/middyjs/middy) or [Middy official website](https://middy.js.org).


## Contributing

Everyone is very welcome to contribute to this repository. Feel free to [raise issues](https://github.com/middyjs/middy/issues) or to [submit Pull Requests](https://github.com/middyjs/middy/pulls).


## License

Licensed under [MIT License](LICENSE). Copyright (c) 2017-2021 will Farrell and the [Middy team](https://github.com/middyjs/middy/graphs/contributors).

<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fmiddyjs%2Fmiddy?ref=badge_large">
  <img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmiddyjs%2Fmiddy.svg?type=large" alt="FOSSA Status"  style="max-width:100%;">
</a>
