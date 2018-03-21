---
date: 2012-03-23T16:13:00+01:00
lastmod: 2012-03-23T16:13:00+01:00
title: "Object-orientation and inheritance in JavaScript: a comprehensive explanation"
description: " Let’s talk about object-orientation and inheritance in JavaScript. The good news is that it’s actually quite simple, but the bad news is that it works completely different than object-orientation in languages like C++, Java, Ruby, Python or PHP, making it not-quite-so simple to understand. But fear not, we are going to take it step by step."
authors: ["manuelkiessling"]
slug: 2012/03/23/object-orientation-and-inheritance-in-javascript-a-comprehensive-explanation
---

<p>Let’s talk about object-orientation and inheritance in JavaScript.</p>
<p>The good news is that it’s actually quite simple, but the bad news is that it works completely different than object-orientation in languages like C++, Java, Ruby, Python or PHP, making it not-quite-so simple to understand.</p>
<p>But fear not, we are going to take it step by step.</p>
<h2 id="blueprints-versus-finger-pointing">Blueprints versus finger-pointing</h2>
<p>Let’s start by looking at how "typical" object-oriented languages actually create objects.</p>
<p>We are going to talk about an object called <em>myCar</em>. myCar is our bits-and-bytes representation of an incredibly simplified real world car. It could have attributes like <em>color</em> and <em>weight</em>, and methods like <em>drive</em> and <em>honk</em>.</p>
<p>In a "real" application, <em>myCar</em> could be used to represent the car in a game which is driven by the player of that game – but we are going to completely ignore the context of this object, because we are going to talk about the nature and usage of this object in a more abstract way.</p>
<p>If you would want to use this <em>myCar</em> object in, say, Java, you need to define the blueprint of this specific object first – this is what Java and most other object-oriented languages call a <em>class</em>.</p>
<p>If you want to create the object <em>myCar</em>, you tell Java to "build a new object after the specification that is laid out in the class <em>Car</em>".</p>
<p>The newly built object shares certain aspects with its blueprint. If you call the method <em>honk</em> on your object, like so:</p>
<pre><code>myCar.honk();</code></pre>
<p>the Java interpreter will go to the class of <em>myCar</em> and look up which code it actually needs to execute, which is defined in the <em>honk</em> method of class <em>Car</em>.</p>
<p>Ok, nothing shockingly new here. Enter JavaScript.</p>
<h2 id="a-classless-society">A classless society</h2>
<p>JavaScript does not have classes. But as in other languages, we would like to tell the interpreter that it should built our <em>myCar</em> object following a certain pattern or schema or blueprint – it would be quite tedious to create every car object from scratch, "manually" giving it the attributes and methods it needs every time we build it.</p>
<p>If we were to create 30 car objects based on the <em>Car</em> class in Java, this object-class relationship provides us with 30 cars that are able to <em>drive</em> and <em>honk</em> without us having to write 30 <em>drive</em> and <em>honk</em> methods.</p>
<p>How is this achieved in JavaScript? Instead of an object-class relationship, there is an object-object relationship.</p>
<p>Where in Java our <em>myCar</em>, asked to honk, says "go look at this class over there, which is my <em>blueprint</em>, to find the code you need", JavaScript says "go look at that other object over there, which is my <em>prototype</em>, it has the code you are looking for".</p>
<p>Building objects via an object-object relationship is called <em>Prototype-based programming</em>, versus <em>Class-based programming</em> used in more traditional languages like Java.</p>
<p>Both are perfectly valid implementations of the object-oriented programming paradigm – it’s just two different approaches.</p>
<h2 id="creating-objects">Creating objects</h2>
<p>Let’s dive into code a bit, shall we? How could we set up our code in order to allow us to create our <em>myCar</em> object, ending up with an object that is a <em>Car</em> and can therefore <em>honk</em> and <em>drive</em>?</p>
<p>Well, in the most simple sense, we can create our object completely from scratch, or <em>ex nihilo</em> if you prefer the boaster expression.</p>
<p>It works like this:</p>
<pre><code>var myCar = {}

myCar.honk = function() {
  console.log("honk honk");
}

myCar.drive = function() {
  console.log("vrooom...");
}</code></pre>
<p>This gives us an object called <em>myCar</em> that is able to honk and drive:</p>
<pre><code>myCar.honk()  // outputs "honk honk"
myCar.drive() // outputs "vrooom..."</code></pre>
<p>However, if we were to create 30 cars this way, we would end up defining the honk and drive behaviour of every single one, something we said we want to avoid.</p>
<p>In real life, if we made a living out of creating, say, pencils, and we don’t want to create every pencil individually by hand, then we would consider building a pencil-making machine, and have this machine create the pencils for us.</p>
<p>After all, that’s what we implicitly do in a class-based language like Java – by defining a class <em>Car</em>, we get the car-maker for free:</p>
<pre><code>Car myCar = new Car();</code></pre>
<p>will built the <em>myCar</em> object for us based on the <em>Car</em> blueprint. Using the <em>new</em> keyword does all the magic for us.</p>
<p>JavaScript, however, leaves the responsibility of building an object creator to us. Furthermore, it gives us a lot of freedom regarding the way we actually build our objects.</p>
<p>In the most simple case, we can write a function which creates "plain" objects that are exactly like our "ex nihilo" object, and that don’t really share any behaviour – they just happen to roll out of the factory with the same behaviour copied onto every single one, if you want so.</p>
<p>Or, we can write a special kind of function that not only creates our objects, but also does some behind-the-scenes magic which links the created objects with their creator. This allows for a true sharing of behaviour: functions that are available on all created objects point to a single implementation. If this function implementation changes after objects have been created, which is possible in JavaScript, the behaviour of all objects sharing the function will change accordingly.</p>
<p>Let’s examine all possible ways of creating objects in detail.</p>
<h3 id="using-a-simple-function-to-create-plain-objects">Using a simple function to create plain objects</h3>
<p>In our first example, we created a plain <em>myCar</em> object out of thin air – we can simply wrap the creation code into a function, which gives us a very basic object creator:</p>
<pre><code>function makeCar() {
  var newCar = {}
  newCar.honk = function() {
    console.log("honk honk");
  }
}</code></pre>
<p>For the sake of brevity, the <em>drive</em> function has been omitted.</p>
<p>We can then use this function to mass-produce cars:</p>
<pre><code>function makeCar() {
  var newCar = {}
  newCar.honk = function() {
    console.log("honk honk");
  }
  return newCar;
}

myCar1 = makeCar();
myCar2 = makeCar();
myCar3 = makeCar();</code></pre>
<p>One downside of this approach is efficiency: for every <em>myCar</em> object that is created, a new <em>honk</em> function is created and attached – creating 1,000 objects means that the JavaScript interpreter has to allocate memory for 1,000 functions, although they all implement the same behaviour. This results in an unnecessarily high memory footprint of the application.</p>
<p>Secondly, this approach deprives us of some interesting opportunities. These <em>myCar</em> objects don’t share anything – they were built by the same creator function, but are completely independent from each other.</p>
<p>It’s really like with real cars from a real car factory: They all look the same, but once they leave the assembly line, they are totally independent. If the manufacturer should decide that pushing the horn on already produced cars should result in a different type of honk, all cars would have to be returned to the factory and modified.</p>
<p>In the virtual universe of JavaScript, we are not bound to such limits. By creating objects in a more sophisticated way, we are able to magically change the behaviour of all created objects at once.</p>
<h3 id="using-a-constructor-to-create-objects">Using a constructor to create objects</h3>
<p>In JavaScript, the entities that create objects with shared behaviour are functions which are called in a special way. These special functions are called <em>constructors</em>.</p>
<p>Let’s create a constructor for cars. We are going to call this function <em>Car</em>, with a capital <em>C</em>, which is common practice to indicate that this function is a constructor.</p>
<p>Because we are going to encounter two new concepts that are both necessary for shared object behaviour to work, we are going to approach the final solution in two steps.</p>
<p>Step one is to recreate the previous solution (where a common function spilled out independent car objects), but this time using a constructor:</p>
<pre><code>function Car() {
  this.honk = function() {
    console.log("honk honk");
  }
}</code></pre>
<p>When this function is called using the <em>new</em> keyword, like so:</p>
<pre><code>var myCar = new Car();</code></pre>
<p>it implicitly returns a newly created object with the honk function attached.</p>
<p>Using <em>this</em> and <em>new</em> makes the explicit creation and return of the new object unnecessary – it is created and returned "behind the scenes" (i.e., the <em>new</em> keyword is what creates the new, "invisible" object, and secretly passes it to the <em>Car</em> function as its <em>this</em> variable).</p>
<p>You can think of the mechanism at work a bit like in this pseudo-code:</p>
<pre><code>// Pseudo-code, for illustration only!

function Car(this) {
  this.honk = function() {
    console.log("honk honk");
  }
  return this;
}

var newObject = {}
var myCar = Car(newObject);</code></pre>
<p>As said, this is more or less like our previous solution – we don’t have to create every car object manually, but we still cannot modify the <em>honk</em> behaviour only once and have this change reflected in all created cars.</p>
<p>But we laid the first cornerstone for it. By using a constructor, all objects received a special property that links them to their constructor:</p>
<pre><code>function Car() {
  this.honk = function() {
    console.log("honk honk");
  }
}

var myCar1 = new Car();
var myCar2 = new Car();

console.log(myCar1.constructor); // outputs [Function: Car]
console.log(myCar2.constructor); // outputs [Function: Car]</code></pre>
<p>All created <em>myCars</em> are linked to the <em>Car</em> constructor. This is what actually makes them a class of related objects, and not just a bunch of objects that happen to have similar names and identical functions.</p>
<p>Now we have finally reached the moment to get back to the mysterious <em>prototype</em> we talked about in the introduction.</p>
<h3 id="using-prototyping-to-efficiently-share-behaviour-between-objects">Using prototyping to efficiently share behaviour between objects</h3>
<p>As stated there, while in class-based programming the class is the place to put functions that all objects will share, in prototype-based programming, the place to put these functions is the object which acts as the prototype for our objects at hand.</p>
<p>But where is the object that is the prototype of our <em>myCar</em> objects – we didn’t create one!</p>
<p>It has been implicitly created for us, and is assigned to the</p>
<pre><code>Car.prototype</code></pre>
<p>property (in case you wondered, JavaScript functions are objects that have properties, too).</p>
<p>Here is the key to sharing functions between objects: Whenever we call a function on an object, the JavaScript interpreter tries to find that function within the queried object. But if it doesn’t find the function within the object itself, it asks the object for the pointer to it’s prototype, then goes to the prototype, and asks for the function there. If it is found, it is then executed.</p>
<p>This means that we can create <em>myCar</em> objects without any functions, create the <em>honk</em> function in their prototype, and end up having <em>myCar</em> objects that know how to honk – because everytime the interpreter tries to execute the <em>honk</em> function on one of the <em>myCar</em> objects, it will be redirected to the prototype, and execute the <em>honk</em> function which is defined there.</p>
<p>Here is how this setup can be achieved:</p>
<pre><code>function Car() {}

Car.prototype.honk = function() {
  console.log("honk honk");
}

var myCar1 = new Car();
var myCar2 = new Car();

myCar1.honk(); // executes Car.prototype.honk() and outputs "honk honk"
myCar2.honk(); // executes Car.prototype.honk() and outputs "honk honk"</code></pre>
<p>Our constructor is now empty, because for our very simple cars, no additional setup is necessary.</p>
<p>Because both <em>myCars</em> are created through this constructor, their prototype points to <em>Car.prototype</em> – executing <em>myCar1.honk()</em> results in <em>Car.prototype.honk()</em> being executed.</p>
<p>Let’s see what this enables us to do. In JavaScript, objects can be changed at runtime. This holds true for prototypes, too. Which is why we can change the <em>honk</em> behaviour of all our cars even after they have been created:</p>
<pre><code>function Car() {}

Car.prototype.honk = function() {
  console.log("honk honk");
}

var myCar1 = new Car();
var myCar2 = new Car();

myCar1.honk(); // executes Car.prototype.honk() and outputs "honk honk"
myCar2.honk(); // executes Car.prototype.honk() and outputs "honk honk"

Car.prototype.honk = function() {
  console.log("meep meep");
}

myCar1.honk(); // executes Car.prototype.honk() and outputs "meep meep"
myCar2.honk(); // executes Car.prototype.honk() and outputs "meep meep"</code></pre>
<p>Of course, we can also add additional functions at runtime:</p>
<pre><code>function Car() {}

Car.prototype.honk = function() {
  console.log("honk honk");
}

var myCar1 = new Car();
var myCar2 = new Car();

Car.prototype.drive = function() {
  console.log("vrooom...");
}

myCar1.drive(); // executes Car.prototype.drive() and outputs "vrooom..."
myCar2.drive(); // executes Car.prototype.drive() and outputs "vrooom..."</code></pre>
<p>But we could even decide to treat only one of our cars differently:</p>
<pre><code>function Car() {}

Car.prototype.honk = function() {
  console.log("honk honk");
}

var myCar1 = new Car();
var myCar2 = new Car();

myCar1.honk(); // executes Car.prototype.honk() and outputs "honk honk"
myCar2.honk(); // executes Car.prototype.honk() and outputs "honk honk"

myCar2.honk = function() {
  console.log("meep meep");
}

myCar1.honk(); // executes Car.prototype.honk() and outputs "honk honk"
myCar2.honk(); // executes myCar2.honk() and outputs "meep meep"</code></pre>
<p>It’s important to understand what happens behind the scenes in this example. As we have seen, when calling a function on an object, the interpreter follows a certain path to find the actual location of that function.</p>
<p>While for <em>myCar1</em>, there still is no <em>honk</em> function within that object itself, that no longer holds true for <em>myCar2</em>. When the interpreter calls <em>myCar2.honk</em>, there now is a function within <em>myCar2</em> itself. Therefore, the interpreter no longer follows the path to the prototype of <em>myCar2</em>, and executes the function within <em>myCar2</em> instead.</p>
<p>That’s one of the major differences to class-based programming: while objects are relatively "rigid" e.g. in Java, where the structure of an object cannot be changed at runtime, in JavaScript, the prototype-based approach links objects of a certain class more loosely together, which allows to change the structure of objects at any time.</p>

<p>Also, note how sharing functions through the constructor’s prototype is way more efficient than creating objects that all carry their own functions, even if they are identical. As previously stated, the engine doesn’t know that these functions are meant to be identical, and it has to allocate memory for every function in every object. This is no longer true when sharing functions through a common prototype – the function in question is placed in memory exactly once, and no matter how many <em>myCar</em> objects you create, they don’t carry the function themselves, they only refer to their constructor, in whose prototype the function is found.</p>

<p>To give you an idea of what this difference can mean, here is a very simple comparison. The first example creates 1,000,000 objects that all have the function directly attached to them:
</p>

<pre><code>var C = function() {
  this.f = function(foo) {
    console.log(foo);
  }
}

var a = [];
for (var i = 0; i &lt; 1000000; i++) {
  a.push(new C());
}
</code></pre>

<p>In Google Chrome, this results in a heap snapshot size of 328 MB. Here is the same example, but now the function is shared through the constructor's prototype:</p>

<pre><code>var C = function() {}

C.prototype.f = function(foo) {
  console.log(foo);
}

var a = [];
for (var i = 0; i &lt; 1000000; i++) {
  a.push(new C());
}
</code></pre>

<p>This time, the size of the heap snapshot is only 17 MB, i.e., only about 5% of the non-efficient solution.</p>

<h2 id="object-orientation-prototyping-and-inheritance">Object-orientation, prototyping, and inheritance</h2>
<p>So far, we haven't talked about inheritance in JavaScript, so let's do this now.</p>
<p>It's useful to share behaviour between a certain class of objects, but there are cases where we would like to share behaviour between different, but similar classes of objects.</p>
<p>Imagine our virtual world not only had cars, but also bikes. Both drive, but where a car has a horn, a bike has a bell.</p>
<p>Being able to <em>drive</em> makes both objects <em>vehicles</em>, but not sharing the <em>honk</em> and <em>ring</em> distinguishes them.</p>
<p>We could illustrate their shared and local behaviour as well as their relationship to each other as follows:</p>
<pre><code>         Vehicle
         &gt; drive

            |
 ----------------------
 |                    |

Car                 Bike
&gt; honk              &gt; ring</code></pre>
<p>Designing this relationship in a class-based language like Java is straightforward: We would define a class <em>Vehicle</em> with a method <em>drive</em>, and two classes <em>Car</em> and <em>Bike</em> which both <em>extend</em> the <em>Vehicle</em> class, and implement a <em>honk</em> and a <em>ring</em> method, respectively.</p>
<p>This would make the car as well as bike objects inherit the drive behaviour through the inheritance of their classes.</p>
<p>How does this work in JavaScript, where we don't have classes, but prototypes?</p>
<p>Let's look at an example first, and then dissect it. To keep the code short for now, let's only start with a car that inherits from a vehicle:</p>
<pre><code>function Vehicle() {}

Vehicle.prototype.drive = function () {
  console.log("vrooom...");
}


function Car() {}

Car.prototype = new Vehicle();

Car.prototype.honk = function() {
  console.log("honk honk");
}


var myCar = new Car();

myCar.honk()  // outputs "honk honk"
myCar.drive()  // outputs "vrooom..."
</code></pre>
<p>In JavaScript, inheritance runs through a chain of prototypes.</p>
<p>The prototype of the <em>Car</em> constructor is set to a newly created <em>vehicle</em> object, which establishes the link structure that allows the interpreter to look for methods in parent objects.</p>
<p>The prototype of the <em>Vehicle</em> constructor has a function <em>drive</em>. Here is what happens when the <em>myCar</em> object is asked to <em>drive()</em>:</p>
<ul>
<li>The interpreter looks for a <em>drive</em> method within the <em>myCar</em> object, which does not exist</li>
<li>The interpreter then asks the <em>myCar</em> object for its prototype, which is the prototype of its constructor <em>Car</em></li>
<li>When looking at <em>Car.prototype</em>, the interpreter sees a <em>vehicle</em> object which has a function <em>honk</em> attached, but no <em>drive</em> function</li>
<li>Thus, the interpreter now asks this <em>vehicle</em> object for its prototype, which is the prototype of its constructor <em>Vehicle</em></li>
<li>When looking at <em>Vehicle.prototype</em>, the interpreter sees an object which has a <em>drive</em> function attached - the interpreter now knows which code implements the <em>myCar.drive()</em> behaviour, and executes it</li>
</ul>

<h2>A classless society, revisited</h2>

<p>We just learned how to emulate traditional (or classical) inheritance in JavaScript. This understanding is needed to successfully unlearn it and leave it behind, in order to embrace the idea that in JavaScript, you really don't need classes at all, and you therefore don't need to emulate them - plus, that's really a lot of code to express the prototypical idea of <em>"go look at that other object over there, it has the code you are looking for"</em>, isn't it?</p>

<p>It was Douglas Crockford who came up with a very clever solution, which allows to let objects directly inherit from each other, without the need for all the boilerplate code presented in the previous example. The solution is a native part of JavaScript by now - it's the <em>Object.create()</em> function, and it works like this:
</p>

<pre><code>Object.create = function(o) {
  function F() {}
  F.prototype = o;
  return new F();
};
</code></pre>

<p>We learned enough now to understand what's going on. Let's analyze an example:
</p>

<pre><code>var vehicle = {};
vehicle.drive = function () {
  console.log("vrooom...");
}

var car = Object.create(vehicle);
car.honk = function() {
  console.log("honk honk");
}

var myCar = Object.create(car);

myCar.honk()  // outputs "honk honk"
myCar.drive()  // outputs "vrooom..."
</code></pre>

<p>While being significantly more concise and expressive, this code achieves exactly the same behaviour, without the need to write dedicated constructors and attaching functions to their prototype. As you can see, <em>Object.create()</em> handles both behind the scenes, on the fly. A temporary constructor is created, its prototype is set to the object that serves as the role model for our new object, and a new object is created from this setup.
</p>

<p>Conceptually, this is really the same as in the previous example where we defined that <em>Car.prototype</em> shall be <em>new Vehicle();</em>.
</p>

<p>But wait! We created the functions <em>drive</em> and <em>honk</em> within our objects, not on their prototypes - that's memory-inefficient!
</p>

<p>Well, in this case, it's actually not. Let's see why:
</p>

<pre><code>var vehicle = {};
vehicle.drive = function () {
  console.log("vrooom...");
}

var car = Object.create(vehicle);
car.honk = function() {
  console.log("honk honk");
}

var myVehicle = Object.create(vehicle);
var myCar1 = Object.create(car);
var myCar2 = Object.create(car);

myCar1.honk()  // outputs "honk honk"
myCar2.honk()  // outputs "honk honk"

myVehicle.drive()  // outputs "vrooom..."
myCar1.drive()     // outputs "vrooom..."
myCar2.drive()     // outputs "vrooom..."
</code></pre>

<p>We have now created a total of 5 objects, but how often do the <em>honk</em> and <em>drive</em> methods exist in memory? Well, how often have they been defined? Just once - and therefore, this solution is basically as efficient as the one where we built the inheritance manually. Let's look at the numbers:
</p>

<pre><code>c = {};
c.f = function(foo) {
  console.log(foo);
}

var a = [];
for (var i = 0; i &lt; 1000000; i++) {
  a.push(Object.create(c));
}
</code></pre>

<p>Turns out, it's not exactly identical - we end up with a heap snapshot size of 40 MB, thus there seems to be <em>some</em> overhead involved. However, in exchange for much better code, this is probably more than worth it.
</p>
