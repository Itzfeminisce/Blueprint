# Blueprint
Blueprint is a standalone code file that adds useful methods to your model and makes life easier for crud operations 



 # Features

Below are the list of features this *light weight* code file allows you to use

## CRUD Operations
````
class User extends Blueprint {
   constructor()
   ...
   create()
   read()
   update()
   delete()
}
````

## Various call cases...

> All methods returns promise

````
const user = new User()

user.read(2) //{name:'foo'}

user.readAll()  // [{name:'foo'}, ...]

user.withId(2).read() `same as user.read(2)`

user.withId(2).readAll() `Same as user.readAll(), .withId(id) is ignored`

user.delete(4) // delete field with id=4

user.withId(5).delete() //same as above

user.create({name:"foo", ... });

user.update(2, {name:"bar"})

user.withId(2).update({name:"Ayo"}) // same as above

````












## Other features

### Accessors

Accessors allow to modify fields before sending to controller/view

This operation is carried out AFTER fetching data from storage 

- Just add the method `getAttribute[FileName](){}` in your `User` class
>Example below

```
class User extends BluePrint {
 ...
 getAttributeName(){
   return this.attributes.name.toUpperCase()
}
````


```
user.withId(id).read().then()
 // returns FOO

```

* Note the `this.attributes.name` part

> This is very important because the 
`.name` is stored in 
`this.attributes` property and can not be accessed
through the `this.name` as this will only return the 
model name

* `getAttribute[Name]` only works with `read()`, `readAll()` methods

* You can use as many `getAttribute[Field]` as possible 




## Mutators
 
Just like the `Accessors`,  you can also declare mutators. 

`Mutators modify attributes BEFORE storing in database`.

They take effect on `create()` and `update()` methods.


- Just add the method `setAttribute[Field]` in your `User` class
> Example below

```
class User extends Blueprint {
 ...
 setAttributeName(){
   return this.attributes.name.toUpperCase()
}
````

> In your code, suppose you have:

````
user.create({name:"foo", ... })

user.readAll()

````


> Returns `[{name: "FOO"}]`
> name was modified BEFORE storage



## Dependencies

Dependencies allows to add sub-classes without having to explicitly `require()` them

> Usage: 

Add `dependencies()` in your `User` class as follows

````
class User extends Blueprint {
  ...

  dependencies (){
   return ["Todo", ...]     // for more than one dependencies 
     // or
   return "Todo"       // for one Dependency
 }
}
````

You can therefore access methods in dependencies as below

`user.todo`

You can even call `Todo` APIs on `User` class as below

`user.todo.readAll()` // returns all todos

or

`user.withId(2).todo.withId(5)`  // returns Todo with 
Id=5 for user whose id=2

or 

`user.todo.withId(5)`  // returns Todo with id=5 for the current user




## Hidden

Just like `dependencies()`, Hidden allows to hide/remove field(s) on retrieval.
They only take effect on `read()` and `readAll()` methods.

> Usage 

Add `hidden()` in your `User` class as follows

````
class User extends Blueprint {
  ...

   hidden(){
   return ["password", ...]     // for more than one fields
     // or
   return "password"       // for one field
 }
}
````

If you try calling `.readAll()` or `.read()`, `password` field will be removed completely.


# Setbacks

* All CRUD methods must be declared as `async` function because they all return promise
* You have to explicitly declare CRUD in your models before accessing them otherwise, we will throw an error.
* All CRUD methods assumes first argument to be `id` of certain field if not
declared under `.withId(id)` method except for `.create()` which expects an object.

However, whatever you pass to your methods can completely be handled by you.

>Example, if you have

`user.update(2, {...}, others)`

You will access your arguments in your model as follows

````
class User extends Blueprint {
  ...

  async update({ id, ...data } = args) {
       
  }
}
````


# To expect

More handy methods are still coming to help create relationship s
between models and assist to manipulate dependencies more easier.


# Contributions

This is still a one man development. Feel free  to modify this code file as you wish.

## Author

@github/author Itzfeminisce

# Links

Facebook - [Itzfeminisce](www.facebook.com/itzfeminisce)

Instagram - [Itzfeminisce](instagram.com/itzfeminisce)
