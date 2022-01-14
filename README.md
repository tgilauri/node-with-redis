## Test application
Application consist of express based REST service,
CarService that get the price either from cache or from external system and express based external API.

Redis is used as a cache and notifier for REST services to be able to subscribe for events.

### Prerequisites

* Node version > 14
* Redis

### Installation

Run `npm ci`

### How to check application
Before you run application make sure you have Redis installed.

Run `npm run test`.

It is going to run several test suites that creates application instances,
external service instance and call to mentioned methods.
