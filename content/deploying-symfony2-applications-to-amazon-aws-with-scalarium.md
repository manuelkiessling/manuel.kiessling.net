---
date: 2011-11-01T16:13:00+01:00
lastmod: 2011-11-01T16:13:00+01:00
title: "Deploying Symfony2 Applications to Amazon AWS with Scalarium"
description: "This here is just me, bragging about myself. You have been warned. This guy with the psychopathic look standing in a room full of rubbish in front of something that vaguely looks like computers is me standing in front of the first MyHammer server cluster, only days before the whole system went into production."
authors: ["manuelkiessling"]
slug: 2011/11/01/deploying-symfony2-applications-to-amazon-aws-with-scalarium
---

<h2 style="color: red">Important Note</h2>
<p>
The methodology explained here is <span style="color: red">outdated</span>, please read <a href="/2012/01/05/deploying-symfony2-apps-via-scalarium-improved-methodology/">Deploying Symfony2 Apps via Scalarium: Improved Methodology</a> for an updated version.
</p>

<h2>About</h2>
<p>
This article describes how to use the cloud-based cluster-management platform Scalarium in order to automatically mass-deploy Symfony2 applications with a MySQL database backend onto clusters of Amazon EC2 virtual machines by creating a special Symfony2 environment, using a custom Chef recipe, and making use of Doctrine migrations.
</p>

<h2>Target audience</h2>
<p>
Current or soon-to-be Scalarium customers, devops interested in deploying Symfony2 applications using centralized configuration management tools like Chef or Puppet, PHP developers.
</p>

<h2>Prerequisites</h2>
<p>
In order to get your Symfony2 application running on Amazon AWS, you need an AWS account, a Scalarium account (correctly set up with your AWS credentials), and a Github account to host your Symfony2 application and your custom Chef recipes. This tutorial assumes that you are already familiar with managing EC2 clusters with Scalarium. It’s tested to work with Symfony 2.0.4 on Ubuntu 11.04 instances.
</p>

<h2>Overview</h2>
<p>
<a href="/images/Logical-overview.png"><img src="/images/Logical-overview-300x225.png" alt=""></a>
</p>

<p>
The above diagram is here to illustrate how the different parts are working together in order to deploy a running application. The virtual machines hosting our Symfony2 application and the database are EC2 instances running in the Amazon AWS cloud. We will use Scalarium to define the layout of our cluster (called a “cloud” in Scalarium), to configure the application which will be deployed onto the application servers within this cluster, and to configure the custom Chef recipes which need to be applied to our application server instances in order to finalize the deployment and setup of our application.
</p>

<p>
Looking at the diagram, we could say that Scalarium <em>manages</em>, Amazon <em>runs</em>, and Github <em>provides</em> – Scalarium uses what Github provides in order to run the application on Amazon.
</p>

<p>
Because Scalarium already provides the setup logic and recipes that allow us to set up basic Apache/PHP application servers and MySQL database servers on AWS, we will only need to provide what is needed in order to finalize the deployment and setup of our specific Symfony2 application – setting up a basic Ubuntu server, installing software packages like PHP, Apache, MySQL, and checking out our Symfony2 application code from Github is all done by Scalarium without the need to provide additional means.
</p>

<h2>The example application</h2>
<p>
It makes sense to follow this tutorial using your own Symfony2 application. However, an example application hosted at <a href="https://github.com/MyHammer/ScalariumExampleSymfony2Application">Github.com → MyHammer → ScalariumExampleSymfony2Application</a> is used to illustrate the process – you are free to use this repository to deploy the application to your Scalarium cloud. The <a href="https://github.com/MyHammer/ScalariumExampleSymfony2Application/commits/master">commit history</a> of this repository also shows step by step which changes need to be applied to a Symfony2 application to prepare it for running on a Scalarium cloud.
</p>

<h2>Setting up a Scalarium cloud for our application</h2>
<p>
Our very first step is to set up a new cloud in Scalarium which manages the EC2 instances, server roles, application configuration and custom Chef cookbooks needed to deploy and run our Symfony2 application.
</p>

<p>
In order to do so, click on <em>Add Cloud</em> in the upper right corner of the main Scalarium administration interface. Choose whatever name you like (I will stick with “Symfony”), define a region that makes sense for you (Europe in my case), and choose “Ubuntu 11.04″ as the default operating system. Please choose “Role Dependent” as the <em>Hostname Theme</em>, because this will make it much easier to follow my explanations whenever I’m talking about specific machine instances.
</p>

<p>
Assuming that you have already set up Amazon AWS in your Scalarium account, please choose the AWS credentials and SSH keys accordingly.
</p>

<p>
You now have an empty cloud. Let’s define these three things in order to host our application:
</p><ul>
<li>An application</li>
<li>Custom Cookbooks</li>
<li>An application server and a database server role</li>
</ul>
<p></p>

<p>
Let’s start with our application. Later, we are going to make some modifications to our application that are necessary for hosting it with Scalarium, but we can already configure it into our cloud. Clicking on <em>Add Application</em> gives us a dialogue in which we can configure where EC2 instances will be able to pull our application from upon bootup or application deployment.
</p>

<p>
I’m going to choose “SymfonyExample” as the name. Please choose “PHP” as the <em>Application Type</em>. If you are going to use the sample application that resides on Github, please choose a <em>Repository Type</em> of “Git”, and enter the following <em>Repository URL</em>: “git://github.com/MyHammer/ScalariumExampleSymfony2Application.git”. All other parameters are not important for now – however, if you are configuring your own private repository, you will need to provide a deploy SSH key.
</p>

<p>
Although this is sufficient to deploy the code from Github onto our instances, it’s not enough to actually get a running application. Additional steps are necessary after the code has been pulled from Github, and those steps need to be performed using a custom Chef recipe. We are going to write this recipe later, but we can already configure the cookbook that contains the recipe into our cloud. On the cloud overview page, select <em>Manage Cookbooks</em> from the <em>Actions</em> dropdown.
</p>

<p>
In the new dialogue, check <em>Enable custom cookbooks</em>, and configure as follows:
</p><ul>
<li><em>Repository Type</em>: “Git”</li>
<li><em>Repository URL</em>: “git://github.com/MyHammer/ScalariumExampleSymfony2ChefRecipes.git”</li>
</ul>
<em>Deploy SSH Key</em> and <em>Branch / Revision</em> don’t need to be filled out.
<p></p>

<p>
As a last step, our cloud needs two machine roles: one for our application servers, and one for our database server. We will start with the application server role. On the cloud overview page, select <em>Add role</em>, and choose the <em>PHP Application Server</em> role.
</p>

<p>
Once you have added it, an additional configuration is necessary: In <em>Custom Recipes</em>, please add the recipe “symfony2::deploy” for the Scalarium actions <em>configure</em> and <em>deploy</em>. This makes sure that our recipe is run everytime our application is deployed to an instance, or whenever the cloud changes.
</p>

<p>
Last but not least, create an additional role <em>MySQL Master</em>. Additional configuration is not needed here. If you like, you can already add and boot an instance for this role.
</p>

<h2>Modifying the Symfony2 application</h2>
<p>
Our Symfony2 application doesn’t need to be re-programmed in any way in order to run via Scalarium – however, its configuration needs to be specifically modified. You can either modify your existing “prod” environment configuration, or you may want to create a new environment called “scalarium”, which is what I did for the example application.
</p>

<p>
The nice thing about Scalarium and Symfony2 is that the former provides a very nice PHP interface to the layout of the current cluster, and the latter provides an easy way to make use of this interface.
</p>

<p>
This allows us to dynamically configure our application’s database setup, avoiding the need to hard code e.g. the IP address of our MySQL master into the application. Here is a step by step description on how to achieve this:
</p>

<p>
First, create a new and empty file <em>/app/config/config_scalarium.yml</em>. This is going to be the main configuration file for the new “scalarium” environment. Fill the file with the following content:

<pre><code>imports:
    - { resource: parameters_scalarium.php }
    - { resource: config.yml }
</code></pre>

This makes our new environment use 99% of it’s settings based on those from the “prod” environment – however, an additional file is imported, <em>/app/config/parameters_scalarium.php</em> – this is where we are going to dynamically define our database settings using the power of Scalarium.
</p>

<p>
Let’s fill <em>/app/config/parameters_scalarium.php</em> with life:

<pre><code>&lt;?php

include_once(__DIR__ . '/../../scalarium.php');

$scalarium = new Scalarium();
$container-&gt;setParameter('database_driver',  'pdo_mysql');
$container-&gt;setParameter('database_host',     $scalarium-&gt;db-&gt;host);
$container-&gt;setParameter('database_port',     '3306');
$container-&gt;setParameter('database_name',     $scalarium-&gt;db-&gt;database);
$container-&gt;setParameter('database_user',     $scalarium-&gt;db-&gt;username);
$container-&gt;setParameter('database_password', $scalarium-&gt;db-&gt;password);
$container-&gt;setParameter('database_path',     null);

unset($scalarium);</code></pre>

What happens here is that the database parameter placeholders like <em>%database_host%</em>, which are used in <em>/app/config/config.yml</em> to configure the database for our application, are programmatically defined based on the current state of the Scalarium cloud. Leveraging the power of the <em>scalarium.php</em> script, which is available in the root directory of our application per default (a symlink is created whenever our application is deployed on an instance), this makes our database config dynamic and therefore always up to date.
</p>

<p>
</p><blockquote>
The creators of Scalarium point out that using <em>scalarium.php</em> is just a convenience. The full-stack alternative would be to write a Chef recipe that generates the configuration file and register this recipe on the <em>configure</em> and <em>deploy</em> events. Inside the Chef recipe Scalarium provides you with all necessary information like which hosts exist in the cloud and what their configuration is (e.g. IP addresses, roles, etc.). See <a href="http://support.scalarium.com/kb/custom-instance-setup">http://support.scalarium.com/kb/custom-instance-setup</a> for further information on how to use the Scalarium cloud structure information in your own recipes.
</blockquote>
<p></p>

<p>
One important thing to consider here is that the settings in <em>/app/config/parameters.ini</em> overwrite settings with the same name in <em>/app/config/parameters_scalarium.php</em> – we therefore need to remove all lines containing “%database” from <em>parameters.ini</em>!
</p>

<p>
The last step is to create a Frontend Controller for our new “scalarium” environment at <em>/web/app_scalarium.php</em>:

<pre><code>&lt;?php

require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';
//require_once __DIR__.'/../app/AppCache.php';

use Symfony\Component\HttpFoundation\Request;

$kernel = new AppKernel('scalarium', false);
$kernel-&gt;loadClassCache();
//$kernel = new AppCache($kernel);
$kernel-&gt;handle(Request::createFromGlobals())-&gt;send();
</code></pre>
</p>

<p>
You can look at a visual before-and-after comparison of all these changes on Github:
<br>
<a href="https://github.com/MyHammer/ScalariumExampleSymfony2Application/compare/d2fad2a06b82471c173bd211a59223075b87ab98...0392bed4c1bf5e08b98a48aff3fd71760c938a93"><img src="/images/github_comparison_symfony2_scalarium_environment-249x300.png" width="249" height="300"></a>

</p><h2>Putting the parts together</h2>
<p>
Our cloud now has everything in place it needs. Its roles are defined, our application servers know where to pull our application from, instances of role “PHP Application Server” are configured to use our custom Symfony2 deploy recipe, and our application has been modified to make use of the dynamic cloud configuration in a new environment called “scalarium”.
</p>

<p>
Let’s take a moment to look at <a href="https://github.com/MyHammer/ScalariumExampleSymfony2ChefRecipes/blob/master/symfony2/recipes/deploy.rb#L1">our custom Chef recipe</a>.
</p>

<p>
What this recipe does is it checks for each application that is going to be deployed if it’s actually a Symfony2 application, and if yes, it starts by updating the vendors (or installing them from scratch if none exist yet), clears the application’s cache, applies database migrations (if any), makes sure that cache and log files and directories are read and writable for those users that need it, installs and configures an Apache vhost file for the app, and disables the default vhost.
</p>

<p>
Ok, let’s deploy our application! All you need to do is to add an instance of role <em>PHP Application Server</em> and boot it up. Everything else happens automatically:
</p><ul>
<li>Scalarium requests an EC2 instance from Amazon AWS which is booted with a fresh Ubuntu 11.04 image</li>
<li>Scalarium sets this machine up with some basic packages like PHP, Apache etc., and executes its basic setup routines (which are Chef recipes, too)</li>
<li>Our Symfony2 application is pulled from Github and deployed to <em>/srv/www/symfonyexample/current</em></li>
<li>The instance executes our custom Chef recipe <em>symfony2::deploy</em> which installs the vendors, clears the app cache, applies the database migrations, installs the web assets, sets users and permissions on cache and log files, and configures an Apache vhost for our application</li>
</ul>
<p></p>

<p>
Once this is done, you can browse to the public IP of the booted application server instance, which will display the Symfony2 welcome page.
</p>
