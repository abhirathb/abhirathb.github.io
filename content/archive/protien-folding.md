---
title:   "Protein folding & The AI 'Solution' : A primer for non-scientists"
date:   2020-11-30 00:00:00 +0530
author: Abhirath Batra
draft: false
---

## TLDR 

Just yesterday, Deepmind published a <a href="https://deepmind.com/blog/article/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology">blog</a> talking about how their AI, AlphaFold2, predicted protein structures in the biennial CASP challenge this year with stunning accuracy. There's been a lot of buzz in the computational science community discussing the ramifications of their work. 

If you've seen the buzz and are curious about protein folding, read on...
This post is supposed to capture the motivation and complexity of the problem for an audience familiar with STEM in some way.

Majorly, this is a post close to my heart since protein folding is the broad problem in which I did my Masters' research. It is the first topic of research I worked in and therefore love talking about!

---

## Quick introduction

Proteins are fundamental to life, as they quite literally <a href="https://www.youtube.com/watch?v=X_tYrnv_o6A">DO things in the body</a>. They transport molecules, help decode the DNA, and digest the food. Infact, they sit at the functional end of the <a href="https://en.wikipedia.org/wiki/Central_dogma_of_molecular_biology">central dogma of biology</a>(i.e. DNA-> RNA -> Protein ; DNA is translated into RNA which is transcribed into proteins)
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Cdmb.svg/1280px-Cdmb.svg.png" alt = "Central Dogma of Biology"/>

## The fuss about structures
If you remember high school, they fold into intricate (quaternary) structures that are highly important to their funciton. Structure matters since a lot of what proteins do as mid-sized molecules depend on them mechanically **docking** with other molecules(throwback to coordinate chemistry!). They exist at a size regime that is a fascinating grey area of where mechanical and chemical effects both matter!
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Docking_representation_2.png/1280px-Docking_representation_2.png" />
Common drugs use this fact. For example, they will try to bind competitively with the target of a protein hence preventing its action (that's how your coffee works!) or attach to a protein at a different site and alter its structure, rendering it useless. 

## The fault in our structures
Now proteins are manufactures in ribosomes, at immense speed, with immense precision. But chemical machinery is not without folly. So sometimes it makes mistakes. The sequence stays the same, but like a bead of strings that can be arranged in anyway, it can be misfolded. Misfolded proteins, as you can guess, malfunction! For diseases like Alzhiemer's, the misfolding of one protein and its aggregation in the brain is one of the primary candidates of being the root cause. 

This just means, that studying the 3-D structure of proteins is of high importance. It is also important to study the path taken by proteins to fold that way.

## Methods of measurement
To see particles that small, NMR and XRAY-crystallography are usually used. Both these methods fall short in: 
1. Being able to capture the entire dynamics of a protein. i.e., WATCH the folding process happen; since the timescales are too short.
2. Giving a model that can help predict the 3-d structure of a protein given its sequence
2. Providing insights into other "meta-stable" conformations which the protein may assume owing to random forces. 

__NB : NMR is able to capture proteins dynamics technically. I'm not too familiar with the shortcomings of solution state NMR. If you have questions though, I'd be happy to point you to my friends in TIFR Hyderabad's National NMR facility who can help answer questions.__ 

These measurements are important because they can help us understand WHY a protein misfolded, and also, how a mutated protein could look folded and thus behave!

## Enter, Computers!

Since experimental methods don't answer these questions, we turn to computational methods. What is done is actually incredibly fascinating! 

We model all the atoms as known in a protein as tiny spherical masses, and model the forces between them including electrochemical bonds, nuclear repulsion and weak forces like van der waal forces. Then, we essentially solve newton's second equation of motion(YEP, the one from 9th grade : $$s_t = u_t + 0.5 * a* t^2$$ ) albeit with a different algebraic formulation, for each of the atoms to predict their trajectory in time

Now, if you were using this equation to study a ball thrown into the air and predict it's entire trajectory, you would want to solve this equation for millisecond intervals, to "see" the ball fly up and then come back down in frames. If you were to take a second interval, the snapshots you would predict would be too far apart. 

 Similarly for the atoms, since you want to capture the smallest relevant motion, you solve for 2-femto-second intervals, that is the timescale at which molecular bonds move owing to the energy from room temperature heat. This may all seem well and good but it is not!
 IF you were to use a perfect model so that it predicts the real thing, you'd still be modelling a molecule in pure vaccum. However, in the body, all of this exists in a water medium. And in water, properties change because of water's dipole and kinetic interactions with the system. 
<img src="https://ars.els-cdn.com/content/image/1-s2.0-S1471489210001463-gr1.jpg" />

 So, you guessed it, the model is made to contain 10s of thousands of water molecules, arranged in a repeating cube, so that the (ideally) modelled system mimics what the molecule will feel inside a living system. 
 
 Now, here we have 100s of thousands of particles, with pairwise forces defined for them, that too not just of one kind. From those, we predict their position 2 femto seconds later. Cool. But for how many steps do we have to see this? Well, events of interest such as folding happen at timescales of microseconds to miliseconds. That means, you'd have to do 10^10 iterations of this system to see meaningful events happening. 

## The curse of dimensionality
 
  This method of modelling and simulating trajectories is called <a href="https://en.wikipedia.org/wiki/Molecular_dynamics#:~:text=Molecular%20dynamics%20(MD)%20is%20a,%22evolution%22%20of%20the%20system.">Molecular Dymanics</a>

It would be obvious by now that the amount of computational horsepower these simulations takes is so huge that reserachers rely on highly distributed computing to get any useful information. Many labs use accesses to super computers while companies like D.E.Shaw reserach built a special hardware called <a href="https://en.wikipedia.org/wiki/Anton_(computer)">Anton</a> right in the heart of Manhattan to simulate their molecules. 

Vijay Pande's(A16Z) lab from Stanford took the crowdfunding approach with the <a href="https://foldingathome.org/"> Folding at Home </a> Project to allow users to lend their extra computational capacity to contribute to folding proteins from home. 

## Theoretical work-arounds

Yet other fields exist where in this problem is formalised in a way to reduce computational requirements. The problem of seeing rare events like folding can be formalised through statistical mechanics to be a problem of sampling from a high dimensional probability distribution where we don't know the entire distribution, but we have a generator which can generate a new random(almost) draw. The simulation generates these states. There are ways that you can use to make this generator generate rarer samples, by let's say turning up the heat in the system to make the molecules vibrate faster. 

Another major way people approach this problem is to think of it in terms of dimensionality reduction, in that a lot of the internal motion of the molecule is actually irrelevant and the true dynamics of the system happen in lower dimensions that capture true transitions. These lower dimensions can be chemical at times, like the dihedral angles on the peptide bonds of 2 amino acids.

Back in IIIT, the approach I worked on with my advisor Dr. Prabhakar Bhimalapuram was trying to use multiple "replicas" of the same system, with a repulsive force between them to make them sample divergent areas of the probability landscape. Here's a <a href="http://web2py.iiit.ac.in/research_centres/publications/view_publication/mastersthesis/680">link</a> if you're interested in reading more. 

## Now comes In AI. 
AI could help solve the issue in many ways : 
1. Help identify lower dimensions in which to simulate and understand the system
2. Predict rare events given a simulated system
3. Directly predict folded states

The third method is what Deepmind's AlphaFold2 has done. It is a complex model that treats the molecular structure as a spatial graph and is then trained using ~170,000 protein structures available publicly. Using that they predicted structures in the CASP14 challenge with incredible and astonishing accuracy. Their own blog contains details of all the incredible results they have and links to their previous paper. 

## Perspective

Deepmind has been able to achieve via computational magic, something that we watch nature do in the blink of an eye. Of course, that's a trite and an unverifiable take on the universe's functioning. 
However, the real ramifications are huge. If it is true that we know the first principles that govern the universe, and have such methods as shortcuts to make predictions about what nature would have made given those first principles, we have a complete toolkit! With these 2 you can study molecules with remarkable detail. 
It not only opens avenues in understanding nuances of what is already there, but also give a huge boost to synthetic biology. 

 We would be able to predict the structures of faulty proteins based on  mutations from the genes encoding them. On that, free energy calculations(from the MD regime) could lend us enormous power to predict their behavior in organisms and predict drug targets.

 We can enter the regime of large-molecule therapeutics. With this tool, we would be able to design synthetic proteins, predict how they fold, and use them as candidates for all sorts of drugs in the body!

 As usual, our ability to predict the future is severely limited!