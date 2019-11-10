# Business Object Bundler or BOB

Welcome to the BOB project! This project is about software design/architecture. 
What is software architecture and why is it important?

> The goal of software architecture is to minimize the human resources required to build and maintain the required system.

The measure of design quality is simply the measure of the effort required to meet the needs of the customer. If that effort is low, and stays low throughout the lifetime of the system, the design is good.

BOB is a container used to help create clean software architecture. By enabling the inversion of dependency with implementation details using the facade pattern. 

> This means, that the bob module can compose one or more objects together for a single grouping of pure business rules that can access implementation details like database gateways without having to explicity depend on these gateways.

These objects are called business objects, they are a group of functions that perform the use cases of an application, or you can think of them as the business rules or policies of your application. By making these objects and functions pure, which means they do not depend on any implementation details, then you can wrap a whole test system around them without having to include the database or web or framework.

### What is a Business Object? 

A business object is a collection of business rules for your application. 
Business rules are what makes your application unique and special, these rules 
are usually defined in terms of entities and iterators, or simply use cases. When
architecting or designing your application the first mission is to define the use 
cases. These use cases frame the requirements of your application.

## What are Implementation Details?

Implementation Details are mostly side effect interfaces to your application, you can think of the following as implementation details.

* Database Access Layer or DAL
* GUI Framework or API Framework
* Services


It is important that all arrows of your details are pointing to the Business Objects as dependencies and that your Business Objects do not depend on your implementation details.

`API Framework --> Business Objects <-- Gateway --> DAL`

It is also important that you can run integration tests and unit tests without any implementation detail.

`Testing Framework --> Business Objects <-- Gateway --> MockDAL`

## Example

``` js
const createBob = require('@twilson63/bob')

const Person = require('./person')
const User = require('./user')
const Permission = require('./permission')

const gateway = require('./gateway')

const bob = createApp(
  // business objects - policies
  [Person, User, Permission], 
  // details
  { gateway: gateway}
)

bob.person.create({ name: 'Tom Wilson'})
  .then(res => console.log(res))
  .catch(err => console.log(err))

```

In this example we are bundling the Person, User and Permission business objects into a single 
bundle or business component, we are also including our database gateway or access layer as an implementation
detail.

This approach allows for the person create use case to leverage the gateway interface to persist the object, 
but the business object can validate the person object and apply any rules or calculations before persisting
to a data store. Once persisted it can check for success and return a successful result or return an error.


### Why do I need this abstraction?

Good question, the main reason is flexibility, by abstracting your business rules and creating a boundry between your details like api framework or database, these details can be changed without changing your business rules.

> Think about it for a minute, what if every requirement or every user change or new use case could be managed in one defined location, so when the stakeholder changes their mind it does not effect or touch several components in the system. 

Another way to think about it, is that stakeholders change their minds all the time, they may want the workflow
to go right, then they may want it to go left, etc. By placing all of those decisions in your `BusinessObjects` 
and decoupling them from your database or api framework, then you can change a lot of the business objects 
control flow and strategies without having to change your framework or database. This means you can wrap a whole test framework around your business objects and you will be able to test a significant amount of your features 
using integration or unit testing libraries without having to load your whole database or api framework.

This can add a lot of confidence to your team, yes it is more effort up front, but the payoff in the end is 
maintainable code.

### Why use a tool like business object bundler? Why not just create my business objects and manage them withouta bundle?

The purpose of the bundler is to give you a way to compose these objects together so that you can create 
and refactor the business object boundaries without having explicit dependencies between the objects or 
the implementation details. There are certainly other ways to accommplish this, but this process can 
save you a lot of time and effort.

## API

The api for BOB is a single function, it takes two arguments, an array of business objects and a
object of details and returns a bundle object.

```
([...businessObjects], {details}) -> {bundle}
```

This bundle object can be used to invoke the use cases defined by the business objects.

Each business object must have a name property that returns a unique string. This string will be
used to access the business object use cases on the bundle.

Then each method on the business object, must be a higher order method that returns a function, which represents the use case function. 

By defining the object with a name property and setting each function as a higher order function to receive implementation details via the returning function invocation, you can create a clean separation between your business rules and implementation details.

### Business Objects

Business Objects are plain javascript objects that have two rules:

* Must always have a name property that returns a string, this needs to be unique in the bundle
* Every function is a higher order function that returns a function that will contain the initialized
implementation details.

Business Object implement application use cases these use cases can be represented as functions attached
to the business object. Often these functions will need to perform calculations, communicate with other
objects and implementation details. Using these use case functions you can get access to other business
objects or details by creating a manual curry or higher order function, or you can leverage curry to 
do the same.

#### Business Object Example

``` js
const { has } = require('ramda')

function validatePerson (person) {
  return has('name', person)
}

module.exports = {
  name: 'person',
  create: (person) => ({ details }) => {
    if (validatePerson(person)) {
      return details.gateway.save(person)
    }
    return Promise.reject({ok: false, message: 'Invalid'})
  }
}
```


Now that you have a Business Object with a use case, called person.create, we want to add it to our application, lets say we have an express api framework.

```
const express = require('express')
const app = express()

const createBundle = require('@twilson63/bob')
const person = require('./person')
const gateway = require('./data/gateway')

const bundle = createBundle([person], [gateway])

app.post('/people', async (req, res) => {
  const result = await bundle.person.create(req.body)
  
})

app.listen(3000)

```

By bundling up the person business object we can inject the data gateway and keep all of the business objects in a boundry where the business objects do not depend on the details directly. This can loosely couple our business rules to the framework and database. Which means that the business objects are easy to test without requiring a database or web framework.

`Framework` -->  `Business Objects` <-- `Database Gateway`

The more decisions of our application we can place in these business objects, the better we can become at creating reliable testable applications. And manage change over time.



### Packaging Options

You can certainly package bob and business objects anywhere, but give some good thought on how you want to partition your business objects for your application. Also the displine required to implement through the dependency process. By separating layers using package components maybe worth the effort to risk developer taking short cuts.

One possible solution is to leverage `npm link` to symlink your business object bundle to your application, this way the changes to your bundle are completely separated and require a versioning process, but can be required into your application at build time. This design can prevent engineers going from the app/api interface straight to the database or service.

```
\
  - bundle
    - objects
    - dal
    - package.json
  - app
    - node_modules
      - [bundle]
    - src
      - index.js
      - components
  - README.md
  - package.json
```

By creating a local npm package and combining at build time using npm link, you can keep your dependencies pure and inverted in your architecture or design.

While this pattern keeps your boundaries strong, there are other benefits to this design.

* Testability
* Swapping Implementation Details

### Everything should be testable without the database and the web.

By separating your business rules from the implementation details, you are able to create `reliable` test plans that can be run in any environment that can run your application, without depending on the web, or a database etc. This can give your team a lot of confidence in building and adding features to the product, when something breaks it is high signal and not a design smell.

### Guess what things change.

Overtime an successful application will continue to get more complex and will require modification, or frameworks will become obsolete, or databases will need to be re-architected. How can you protect your application from these changing implementation details? With a clean architecture you can turn these migrations into managable migrations that can be planned and executed on time in stride to other priorities, and have strong confidence that you will be successful in the migration.

### Frequently Asked Questions

 
