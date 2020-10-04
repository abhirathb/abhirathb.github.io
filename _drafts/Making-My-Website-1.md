---
layout: post
title:  "Making my Website - Part 1 : Defining a goal, and then compromising"
date:   2020-09-30 00:00:00 +0530
tags: blog engineering
author: Abhirath Batra
---

## The North Star

I have wanted to blog and build projects for a really long time, but with both those things, the paralyzing question has always been, what to write, what to build! This has led to 3 different writing outlets, created and then closed; 7 Github repositories, created, forked, and then deleted. 

To solve this problem, I figured the better question was to ask, when I do write or code, what do I do that for, and then see how much of that would be interesting to share with people. The answer to that question turned out to be:

* I like to journal thougths on things that are consuming >50% of my headspace to sort of shelve those thoughts. **Doing that would typically lead me to more clarity, than simply mulling over it in my head**
* Note-making while learning something new is one of my favourite things. Markdown is my goto when doing that. 
* Because of having spent the better part of college and life after in research related work, I've gotten more handy with writing scripts, than writing Apps or use frameworks. I seem to make projects like M&Ms rather than elaborate meals!

This lead to me to think, that my website should be the platform for me to majorly write thoughts on things I'm learning. Anything I do to chase random curiosities should have a place rather than for this to have a major theme that would restrict me in anyway. Institutions driving our lives already do that enough, I'd like for this website to be free in that respect.

Similarly, I want the website to have a section to host interfaces to various small projects that I make so that they can be served as APIs. It should allow me to put out random scripts/functions/algorithms for a user to play around with on simple interfaces.

In essence I'd like for it to look like this : 


## North Star Architecture

The first obvious choice would be to run a simple Flask/Node/Angular app with different pages doing different things. But it seems like a waste to run a server that will for the most part just serve static. 

A good candidate for this seems to be the architecure in vogue i.e.  **Serverless** ! Naturally this would require for me to use a cloud platform. Given that I work in Azure itself, it follows naturally that I'll use it to build. 

* I imagine that my static site will sit on Azure Storage
* The static stuff will potentially be served by a CDN
* REST/GraphQL API will sit in Azure Functions

**NB:** I found that Azure has a specific solution for developing this kind of a setup, called [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=vanilla-javascript).

### Side note on choice of Front End framework 

I decided to look at JS based frameworks like Angular, React and Vue and my friends who are FrontEnd experts suggested React as a good entry point. Gatsby looked like an excellent framework to develop static sites. However, it also seemed like overkill at this point since most of site is going to be static. When I do setup pages that have dynamic content, I would like to introduce controlled amounts of JS in an attempt to learn how it works inside. Infact, Jekyll helps that way with static because I can over-ride a theme, and learn CSS on the way, while Liquid as a templating engine takes care of repetitive parts. 

## Step 0 : Bootstrapping. Because shipping is more important!

At the time of writing this article, this is what my incredibly straightforward setup looks like : 

* Website build using Jekyll. _Will continue with this_
* Using Minimal theme, with slight modifications. _Will continue adapting this one_
* Hosted on Github Pages. 
* Domain name in GoDaddy
    * CNAME record to point to address
    * A Name records to point to GitHub's DNS servers. [Click Here](https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) for directions.

## Migrating my Jekyll generated website to Azure

### Step 1 : The basic setup

**Setup Azure Static Websites for Jekyll using this rather precise piece of [documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-jekyll)**

* This created a Static Web App in Azure
* A Github action got created to build the Jekyll website and pick the build from the output directory.
* Website is now accessible at the URL it gives

### Step 2 : Changing the Domain Name records

* Removed all the DNS records on GoDaddy
* Replaced that with one CNAME record or the subdomain www. 
* Add custom domain the Static Website on Azure. 

Now, sadly this results in the website now becoming www.abhirathb.com. I don't necessarily mind that but, I want the root domain to be accesible as well. 

Some amount of Googling seems to suggest that that's not possible on Static Web Apps *Preview* as of now! Atleast not without some special jugglery with DNS records that GoDaddy doesn't seem to allow. Also, I'm not in the mood to do jugglery like that!

So let's regress and look at if we can use Azure Storage

* With that, we will have to attach own cert with CDN as managed certs don't support root domain and i want all flexibility
* testing out setting up a new branch with action that triggers recplication to azure storage since otherwise copy is hard

