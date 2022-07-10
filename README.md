# Blueprint
Blueprint is a standalone code file then adds useful methods to your model and makes life easier for crud operations 



 # Features
 ## Below are the list of features this *light weight* Library allows tou to use

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
const user = new User

user.withId(id).read().then(results=>console.log(results)) ** //[results...]
````

> You can also call the method(all of them) using

```
user.read(id).then  // same results
````

# Other features

- Accessor [getAttribute() => ATTRIBUTE]
- Mutator [setAttrubute() => ATTRIBUTE]
- Dependencies [dependencies()=>dependency]
- Hidden [hidden() => []]
 
