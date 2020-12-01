---
layout: post
title:  "Building my website - Part 1"
date:   2020-11-28 00:00:00 +0530
tags: blog engineering
author: Abhirath Batra
---

I have endlessly agonized over the choice of how to host my website because of the absolutely terrifying number of options out there. This is a short look into what I chose and why. 

## What setup do you use?
While this is my attempt at finding the right fit, I'm sure there are better options out there. Tweet at me with your choice for running a personal website/blog as a dev!

## The North Star

I have wanted to blog and build projects for a really long time, but with both those things, the paralyzing questions have always been, what to write and what to build! This has led to 3 different writing outlets, created and then closed; 7 Github repositories, created, forked, and then deleted. 

To solve this problem, I figured the better question was to ask, when I do write or code, what do I do that for, and then see how much of that would be interesting to share with people. The answer to that question turned out to be:

* I like to journal thougths on things that are consuming >50% of my headspace to sort of shelve those thoughts. **Doing that would typically lead me to more clarity, than simply mulling over it in my head**
* Note-making while learning something new is one of my favourite things. Markdown is my goto when doing that. 
* Because of having spent the better part of college and life after in research related work, I've gotten more handy with writing scripts, than writing Apps or use frameworks. I seem to make projects like M&Ms rather than elaborate meals!

This lead to me to think, that my website should be the platform for me to majorly write thoughts on things I'm learning. Anything I do to chase random curiosities should have a place rather than for this to have a major theme that would restrict me in anyway. Institutions driving our lives already do that enough, I'd like for this website to be free in that respect.

Similarly, I want the website to have a section to host interfaces to various small projects that I make so that they can be served as APIs. It should allow me to put out random scripts/functions/algorithms for a user to play around with on simple interfaces.

In essence I'd like for it to look like this : 

## Architecture

The first obvious choice would be to run a simple Flask/Node/Angular app with different pages doing different things. But it seems like a waste to run a server that will for the most part just serve static. 

A good candidate for this seems to be the architecure in vogue i.e.  **Serverless** ! Naturally this would require for me to use a cloud platform. Given that I work in Azure itself, it follows naturally that I'll use it to build. 

* I imagine that my static site will sit on Azure Storage
* REST/GraphQL API will sit in Azure Functions

**NB:** I found that Azure has a specific solution for developing this kind of a setup, called [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=vanilla-javascript).

### Side note on choice of Front End framework 

I decided to look at JS based frameworks like Angular, React and Vue and my friends who are FrontEnd experts suggested React as a good entry point. Gatsby looked like an excellent framework to develop static sites. However, it also seemed like overkill at this point since most of site is going to be static. When I do setup pages that have dynamic content, I would like to introduce controlled amounts of JS in an attempt to learn how it works inside. Infact, Jekyll helps that way with static because I can over-ride a theme, and learn CSS on the way, while Liquid as a templating engine takes care of repetitive parts. 

## Step 0 : Bootstrapping. Because shipping is more important!

At the time of writing this article, this is what my incredibly straightforward setup looks like : 

* Website build using Jekyll.
* Using Minimal theme, with slight modifications
* Hosted on Github Pages. 
* Domain name in GoDaddy
    * CNAME record to point to address
    * A Name records to point to GitHub's DNS servers. [Click Here](https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) for directions.
* Adding **Google Analytics** to get statistics on page views.

## Eliminations!

### Option 1: ~~Azure Static WebApps~~

1. **Setup Azure Static Websites for Jekyll using this rather precise piece of [documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-jekyll)**

2. This created a Static Web App in Azure which is available on a given URL. A Github action got created to build the Jekyll website and pick the build from the output directory.

3. Problem : Changing the Domain Name records

Without some jugglery around DNS proxy records, Static Web Apps(Preview) only lets you setup a www domain for the website. My address would be www.abhirathb.com. I don't necessarily mind that but, I want the root domain to be accesible as well. 

### Option 2: ~~Azure Storage~~

Hosting the site's static on a simple storage container would require managing your own SSL certificate since managed certs don't support the root domain. Managing an SSL cert just adds complexity that's not needed right now. Also, this route will require setting up a new branch with action that triggers recplication to Azure Storage because copying each time would be pointless.

Again managing SSL certs is added overhead for a blog. It would make sense for many other scenarios but for a blog it seems like over-kill. 

## And the winner is...

Finally, I'm back to square one. I've decided to stick to Github Pages for static store since that's just simple and route APIs to Azure. This is highly anti-climactic but I chose to go for the simplicity because it made sense. I also did look at AWS S3 and it did seem to have options to host with the TLD attached to the static website but that all seemed like too much work for the simple task of serving static files. Ideally, it should have been behind an Apache Server running on a small machine, even a RaspberryPi. Github pages removes costs, simplifies hosting and leaves me to build other stuff.

I wished to make a small quickly patched up API to make for a playable test but I don't have anything interesting to showcase just yet. But I hope to fill that void soon!

