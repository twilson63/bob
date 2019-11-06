# Business Object Bundler or BOB

> What is a Business Object? 
> A business object is a collection of business rules or use cases for your application. 
> It is what makes your application unique or special and they should be pure.

> What is the Business Object Bundler?
> The business object bundler is an abstract container that can compose
> 1 or more business object bundles and provide access to the use case
> functions of the business objects. It can also allow the user to inject
> one or more detail objects into the each business object use case
> function.

The Business Object bundler takes pure business objects and composes them
into a super object one might call a component or an application, the super 
object takes the name property of each Business Object and uses it as a key
in the business object component. Then for each function on every business
object it wraps the function to inject the business object component 
and details object. This allows the business objects to communicate with each 
other without having to contain explicit dependencies as well as allows the
details to be accessible without having direct dependencies. 

## Implementation Details

Implementation Details are mostly side effect interfaces to your application, you can think of the following as implementation details.

* Database Access Layer or DAL
* GUI Framework or API Framework
* Services

You want to add these details to your Business Object Bundler so that each Business Object can interact with I/O devices via interfaces.

It is important that all arrows of your details are pointing to the Business Objects as dependencies and that your Business Objects do not depend on your implementation details.

API Framework --> Business Objects <-- DAL Gateway --> DAL

It is also important that you can run integration tests and unit tests without any implementation detail.

Testing Framework --> Business Objects <-- DAL Gateway --> MockDAL

## Example

``` js
const createApp = require('@twilson63/bob')

const Person = require('./person')
const User = require('./user')
const Permission = require('./permission')

const DALGateway = require('./dal-gateway')

const app = createApp(
  // business objects - policies
  [Person, User, Permission], 
  // details
  { gateway: DALGateway}
)

app.person.create({ name: 'Tom Wilson'})
  .then(res => console.log(res))
  .catch(err => console.log(err))

```

In this example we are bundling the Person, User and Permission business objects into a single 
container or bundle, we are also including our database gateway or access layer as an implementation
detail.

This approach allows for the person create use case to leverage the gateway interface to persist the object, 
but the business object can validate the person object and apply any rules or calculations before persisting
to a data store. Once persisted it can check for success and return a successful result or return an error.

> What is the point? Why don't I just call the gateway straight from the api? Or why don't I just access the
database from the api?

> These are good questions, and the main reason is flexibility, by abstracting your business rules and creating 
a boundry between your details like api framework or database, these details can be changed without changing your
business rules.

> Another way to think about it, is that stakeholders change their minds all the time, they may want the workflow
to go right, then they may want it to go left, etc. By placing all of those decisions in your `BusinessObjects` 
and decoupling them from your database or api framework, then you can change a lot of the business objects 
control flow and strategies without having to change your framework or database. This means you can wrap a whole 
test framework around your business objects and you will be able to test a significant amount of your features 
using integration or unit testing libraries without having to load your whole database or api framework.

> This can add a lot of confidence to your team, yes it is more effort up front, but the payoff in the end is 
more maintainable code.

> Why use a tool like business object bundler? Why not just create my business objects and manage them without
a container?

> The purpose of the bundler is to give you a way to compose these objects together so that you can create 
and refactor the business object boundaries without having explicit dependencies between the objects or 
the implementation details. There are certainly other ways to accommplish this, but this process can 
save you a lot of time and effort.






