# 0x Tracker API

[![Travis (.org)](https://img.shields.io/travis/0xTracker/0x-tracker-api.svg?style=flat-square)](https://travis-ci.org/0xTracker/0x-tracker-api)
[![David](https://img.shields.io/david/0xTracker/0x-tracker-api.svg?style=flat-square)](https://github.com/0xTracker/0x-tracker-api)
[![Codecov](https://img.shields.io/codecov/c/github/0xTracker/0x-tracker-api.svg?style=flat-square)](https://codecov.io/gh/0xTracker/0x-tracker-api)

> NodeJS API built for [0x Tracker](https://0xtracker.com) which exposes 0x protocol data and metrics for consumption by the [0x Tracker Client](https://github.com/0xTracker/0x-tracker-client) application.

## Contents

- [Requirements](#-requirements)
- [Getting Started](#-getting-started)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [NPM Scripts](#-npm-scripts)
- [Nodemon](#-nodemon)
- [Continuous Integration](#-continuous-integration)
- [Maintainers](#-maintainers)
- [License](#-license)

## 👮‍♂️ Requirements

[Node.js](https://nodejs.org/en/) is required to run the server application. A `.nvmrc` file is provided for the convenience of using [NVM](https://github.com/creationix/nvm).

You'll need a MongoDB database populated with data from the [0x Tracker Worker](https://github.com/0xTracker/0x-tracker-worker) process. For the time being this will need to be done by running the 0x Tracker Worker against your database. In the future the goal is to have a subset of data available as backups for getting up and running quickly.

It's recommended that you use [Prettier](https://prettier.io) and [ESLint](https://eslint.org) editor plugins if contributing to the project. Pre-commit hooks are in place which will prevent code which doesn't conform to Prettier/ESLint rules from being committed.

## 🐣 Getting Started

Assuming you have all the pre-requisites, getting started is pretty simple:

```
$ npm i
$ cp .env.example .env
$ npm start
```

If you're not running MongoDB on the default local port then jump into your projects `.env` file and modify the connection string before running `npm start`.

## 🦄 Tech Stack

If you plan to contribute to the project then its worthwhile familiarising yourself with the following tools which constitute the bulk of the tech stack.

### Core Libraries

- **[Koa](https://koajs.com/)** - Node.js web framework which handles API routing and response building.
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ORM providing simple and secure access to the database.
- **[Node-config](https://github.com/lorenwest/node-config)** - Handles application level configuration through config files and environment variables.
- **[0x.js](https://0xproject.com/docs/0x.js)** - Official 0x Protocol helper library for manipulating 0x fill data.
- **[Axios](https://github.com/axios/axios)** - Lightweight HTTP client used for fetching API data.
- **[Lodash](https://lodash.com/)** - Powerful general purpose utility belt for writing clean code.
- **[Moment.js](http://momentjs.com/)** - Begrudgingly used as a fallback when manipulating UTC dates whilst awaiting UTC support in date-fns.

### Testing & Linting

- **[Jest](https://jestjs.io/)** - All-in-one Javascript testing framework which executes unit & integration tests.
- **[ESLint](https://eslint.org/)** - Provides linting for Javascript code ensuring common code quality issues are surfaced and preferred coding conventions are automated.
- **[Prettier](https://prettier.io)** - An opinionated code formatter which ensures consistent formatting across the codebase.
- **[husky](https://github.com/typicode/husky)** - Ensures git pre-commit hooks are in place to enforce ESLint & Prettier rules.
- **[lint-staged](https://github.com/okonet/lint-staged)** - Speeds up pre-commit hooks by ensuring only the modified files are linted.

### Developer Experience

- **[Renovate](https://renovatebot.com/)** - Helps keep dependencies up to date by monitoring for updates and automatically opening pull requests.

## 🌳 Project Structure

The project structure is designed to minimize the number of directories, increase discoverability and ensure related code is grouped together. Feature code is grouped based on what "feels right" and is subject to refactoring over time.

If a convention exists for locating configuration files related to developer tooling then it should be followed (e.g. `.babelrc` or `.eslintrc.js`).

- **config** - Tooling configuration which doesn't have a conventional location.
- **src** - Application specific code and test files.
  - **app** - Koa application files.
    - **middleware** - Custom Koa middleware.
    - **routes** - Koa routers.
    - **util** - Utilities used by Koa application files.
  - **config** - Application configuration files used by Node-config.
  - **[feature]** - Business logic and helpers related to a specific feature.
    - **...**
  - **model** - Mongoose document models.
  - **util** - All other helper functions used to support the codebase.
  - **constants.js** - Shared constants. Each constant should be a named export.
  - **index.js** - Application entry point.

## 🤖 NPM Scripts

A number of NPM scripts are provided for automating common tasks.

- **lint** - Lint all code files in the project.
- **start** - Start the API server.
- **test** - Run unit/integration tests and produce coverage report.
- **test:watch** - Run unit/integration tests in watch mode.

## 👀 Nodemon

The recommended way of developing locally with 0x-tracker-api is to use [Nodemon](https://nodemon.io/). The project has a Nodemon configuration file which ensures the application will restart whenever relevant files are changed.

To get started with Nodemon:

```
$ npm i -g nodemon
$ nodemon
```

## 🚨 Continuous Integration

Continuous integration for the project is handled by [Travis CI](https://travis-ci.org/0xTracker/0x-tracker-api/builds) which runs linting, tests, and builds the sources for every pull request. Merged pull requests are automatically deployed to production.

## 👨‍💻 Maintainers

- Craig Bovis ([@cbovis](https://github.com/cbovis))

## Supporters

Infrastructure for 0x Tracker is generously supported by these companies.

<table>
  <tr>
    <td align="center"><a href="https://bugsnag.com"><img src="https://0xtracker.com/assets/supporters/bugsnag.png" width="120px;" alt="Bugsnag"/><br /><sub><b>Bugsnag</b></sub></a></td>
    <td align="center"><a href="https://cryptocompare.com"><img src="https://0xtracker.com/assets/supporters/crypto-compare.png" width="120px;" alt="CryptoCompare"/><br /><sub><b>CryptoCompare</b></sub></a></td>
    <td align="center"><a href="https://netlify.com"><img src="https://0xtracker.com/assets/supporters/netlify.png" width="120px;" alt="Netlify"/><br /><sub><b>Netlify</b></sub></a></td>
  </tr>
</table>

## 👩‍⚖️ License

[Apache 2.0](https://github.com/0xTracker/0x-tracker-worker/blob/master/LICENSE)
