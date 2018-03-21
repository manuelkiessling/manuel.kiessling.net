---
date: 2012-01-05T16:13:00+01:00
lastmod: 2012-01-05T16:13:00+01:00
title: "Deploying Symfony2 Apps via Scalarium: Improved Methodology"
description: "Some weeks ago I wrote about deploying Symfony2 Applications to Amazon AWS with Scalarium. It turned out that the described methodology can be refined in several ways. Here’s how."
authors: ["manuelkiessling"]
slug: 2012/01/05/deploying-symfony2-apps-via-scalarium-improved-methodology
---

<p>
Some weeks ago I wrote about <a href="/2011/11/01/deploying-symfony2-applications-to-amazon-aws-with-scalarium/">deploying Symfony2 Applications to Amazon AWS with Scalarium</a>. It turned out that the described methodology can be improved in several ways. Here’s how.
</p>

<p>
First, let’s discuss what’s suboptimal with the previously described approach. The basic idea was to provide a custom Chef recipe which is executed on our instances whenever our Symfony2 application gets deployed. This recipe took care of
</p><ul>
<li>
executing the tasks which need to be done whenever the application is deployed, like installing the Symfony2 vendors or cleaning the application cache
</li>
<li>
configuring Apache to correctly serve the application
</li>
</ul>
<p></p>

<p>
Well, the problem is that these are really two very different tasks which shouldn’t be mixed together.
Updating the web server configuration every time you release a new version of your application simply doesn’t make sense.
</p>

<p>
Thanks to <a href="http://wiki.opscode.com/display/chef/Deploy+Resource">Chef deployment hooks</a>, we can separate these tasks. Whatever needs to be done upon application deployment can be provided within the application itself, making it much more self-contained. This way, application business logic and application deployment logic live in the same source tree.
</p>

<p>
On the other hand, system configuration steps which aren’t specific to deploying a new version of your application, but are specific to hosting your application in a given system context, shouldn’t be bundled with your application, but with your system context.
</p>

<p>
Thus, we are going to separate the deployment recipes and the system setup recipes. We will provide the deploy recipes from our application, and the system setup recipes through a custom Chef cookbook, just as we did in <a href="/2011/11/01/deploying-symfony2-applications-to-amazon-aws-with-scalarium/">the first version of this tutorial</a>.
</p>


<p>
Let’s look at <a href="https://github.com/MyHammer/ScalariumExampleSymfony2ChefRecipes/blob/b325adb91f421ca87eacf8f545339324bfccfc2a/symfony2/recipes/deploy.rb">the old version of our deploy.rb recipe</a>, and decide which parts are related to the deployment of our application, and which parts are related to hosting our application.
</p>

<p>
Well, it’s actually quite simple – everything from the beginning of the file through <a href="https://github.com/MyHammer/ScalariumExampleSymfony2ChefRecipes/blob/b325adb91f421ca87eacf8f545339324bfccfc2a/symfony2/recipes/deploy.rb#L44">line 44</a> is stuff that needs to be done upon every single deployment, or else we wouldn’t end up with a working application.
</p>

<p>
Let’s move this part of the deployment recipe into our application. Where does it belong? When Scalarium’s Chef deploys our application, it looks for certain scripts in the <em>/deploy</em> directory of our application:
</p><ul>
<li>/deploy/before_migrate.rb</li>
<li>/deploy/before_symlink.rb</li>
<li>/deploy/before_restart.rb</li>
<li>/deploy/after_restart.rb</li>
</ul>
As their names imply, these scripts are triggered at certain points of the deployment lifecycle. They are closely related to the steps that are necessary when deploying Ruby on Rails applications, and thus not all of them are useful for us when deploying a Symfony2 application.
<p></p>

<p>
For the steps we want to execute with our recipe (installing the vendors, clearing the app cache, executing db migrations, installing the assets, and chowning app cache and log dirs), the <em>before_symlink.rb</em> is just fine – it hooks into the deployment process the moment before Chef, after downloading the application source code from Github, changes the symbolic link at <em>/srv/www/symfonyexample/current</em> to the newly downloaded release. At this moment, we have all the source code available, but it is not yet put into production, thus it’s the most sensible moment for additional setup steps.
</p>

<p>
Moving the deployment-specific parts of our recipe into this hook gives us a <em>before_symlink.rb</em> script as it’s available in our <a href="https://github.com/MyHammer/ScalariumExampleSymfony2Application/blob/9bf49a35f352809c06c25b825c8b1f7386eaae2a/deploy/before_symlink.rb">ScalariumExampleSymfony2Application repository on GitHub</a>.
</p>

<p>
The rest of the original recipe is all about configuring Apache in a way that gives us a working vhost for serving our application – this configuration may change, but it isn’t related to any specific deployment. Thus, these steps should be done only when our Scalarium/AWS instance is set up, and not on every deployment.
</p>

<p>
And as with the deployment steps, there is a better way to set up Apache for our application, too. Turns out, we don’t need a recipe at all. The reason is that Scalarium implements a very convenient substitution logic – if our own cookbook provides a file with the same name at the same location as one from the Scalarium-provided cookbooks, the file from our own cookbook “wins” and is used instead.
</p>

<p>
The Scalarium file we are going to substitute is located at <a href="https://github.com/scalarium/cookbooks/blob/master/mod_php5_apache2/templates/default/web_app.conf.erb">/mod_php5_apache2/templates/default/web_app.conf.erb</a>. By providing this file <a href="https://github.com/MyHammer/ScalariumExampleSymfony2ChefRecipes/blob/f5850713ef4663175ad326d709f8e03ad8737243/mod_php5_apache2/templates/default/web_app.conf.erb">in our own cookbook repository</a>, it’s used as the template for our Symfony2 application vhost – we don’t even need to define “symfony2::deploy” as a <em>Custom Recipe</em> anymore.
</p>

<p>
And that’s it. As described in my previous post on this topic, we need to configure our Scalarium cloud with the information on our custom cookbook and our application, but instead of manually hooking our custom recipe into the <em>configure</em> and <em>deploy</em> events in Scalarium, our newly created deploy hook now lives in the application itself, and is automatically triggered on every deployment, and our newly created <em>web_app.conf.erb</em> Apache vhost template is automatically used by Scalarium’s Chef when setting up new PHP application server instances.
</p>
