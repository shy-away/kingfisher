# Kingfisher

This project is abandoned, but I learned a lot from it.

***Note: The dependencies of this project may have been caught in the Shai-Hulud 2.0 attack. If you want to play with this project, BEFORE running `npm i`, I HIGHLY recommend scanning this project for any compromised dependencies using something like the [Shai Hulud 2.0 Detector](https://github.com/gensecaihq/Shai-Hulud-2.0-Detector) or similar.*** (For the record, `npm audit` finds no high-severity vulns as of 12/2/2025.)

## Table of Contents
1. [Inspiration](#inspiration)
2. [Journey](#journey)
3. [Takeaways](#takeaways)

## Inspiration

### Backstory

I had come across a method for adult chess improvers, known as the Woodpecker Method. This method boils down to solving a bunch of chess puzzles in a structured way. As someone interested in both chess and development, I thought it'd be interesting to create an app that handles that "Woodpecker structure" automatically.

I was also curious about Electron apps, because it sounded like a cool idea to use JS tools to make a cross-platform desktop app. Using Electron would also sidestep any authentication system, which I generally don't like dealing with (although knowing now how this project went, I may have to figure out some way to handle authentication in the future).

Lastly, part of the impetus for this project was to break out of tutorial hell by exposing myself to technologies that I'd learn how to use on-the-fly.

### Planning

When mapping out this idea, I used AI to help brainstorm a general progression of how the app would come to be. (I forget the model I used; it may have been Opus 4 Thinking or possibly Gemini 2.5.) The idea would be to first get a chessboard rendered, then create a functional puzzle-solving environment, then create a local DB and store all the details, and spruce up the UI along the way.

For getting the chess puzzles, I could use the Lichess API, which has great documentation and worked well as a puzzle source. The AI suggested using chess.js, which is a great tool that ended up working. However, the AI also suggested using `react-chessboard`, an npm package that I later had issues with.

In a previous project, I used Bootstrap 5 as a UI framework. While it was functional, I found the many layers of nesting bothersome. For this project, I wanted to explore another UI framework, shadcn/ui. I was able to get it to work, but not without serious complications.

## Journey

### Beginning

I started by creating a test app in Electron, and learning about how Electron works -- the design philosophy of packaging Chromium and Node into the app, the process architecture, and how to communicate securely between processes. I essentially followed the Electron documentation for getting started, creating a (first) local test app.

Knowing that I also wanted to test React integration in an Electron app, I used Electron Forge's `create-electron-app` tool to actually create a second local test project. I ended up also using Vite, which I already have experience with, and Typescript, which I figured wouldn't be a huge leap from what I already know about JS. This all came bundled together in the Vite + Typescript template from Electron Forge.

I decided, still in this (second) test app I created locally on my machine, to also begin to test `react-chessboard`. I explored the documentation, and basically copied the example given in their docs for allowing the player to play against a random-move bot. You can still see the resulting code in `testChess.tsx`.

### GitHub Conversion

Eventually, I realized that it'd probably be easier to just use this (second) test project and convert it to my actual project, which would include pushing it up to GitHub. Up to this point, I had never began an actual project on my own computer and uploaded it to GitHub; I was used to creating a repo on GitHub and cloning it to my machine, not the other way around.

This was mostly a straightforward process, with the exception of licensing. Luckily, however, GitHub has a specially designed workflow for creating a license file. I initially chose an MIT license, but I later changed it to GPLv3 due to the Share Alike requirement of some of my dependencies.

### Dependency Hell

At this point, I wanted to begin to integrate shadcn/ui. However, the docs don't have a guide for setting up shadcn in an Electron app, so I had to use the manual guide. The first step was installing Tailwind, and it was at this point that I ran into my first series of major problems.

There had already been hints that the Vite + TS template provided by Electron Forge was out of date. For one thing, it didn't include React by default. There are some repos that I could have cloned that included React + Vite + TS in Electron, but since I already had my project going, I decided to just manually copy their file structure and some of their config options.

But the major problem with the Electron Forge template was that the dependencies were so out of date that Tailwind wouldn't install. The install guide for Tailwind assumes up-to-date dependencies that the template didn't provide. The template, for example, used TS 4 instead of 5, and Vite 5 instead of 7. I wasn't totally sure how to proceed from here. I figured I should update my dependencies, but this posed a number of other problems regarding ES6 compatibility.

Electron apps are designed to use `require()`, I believe because that's what works in all Node environments. But I was concerned about using ES6 instead, or at least making my codebase compatible with ES6 syntax, because I think it ultimately needed to be in order to use Tailwind.

Between updating dependencies, learning about CommonJS, learning about TS config options and Vite config options (and how Vite wraps another tool, Rollup, that requires its own configs), and slogging through endless npm error messages and warnings (some of which had to do with using a FAT32 file system instead of NTFS), I wondered at the time whether I could even get through all of it. But I strangely felt like I still understood enough of the puzzle to maybe, just maybe, solve it.

My initial approach, apart from learning what I could about the tools I was using, did involve using AI to try and understand what *might* be going on. I began to see how shortsighted and incorrect AI "help" can often be, especially with a project that has so many details that it'd be hard to fit all of it into a prompt. Until this point I had resisted using any agentic tools via GitHub Copilot (my IDE is VS Code), but I figured this might be a good (?) use case for this. I let Haiku 4.5 take an agentic stab at my project, and... it didn't help. It produced TS config options that, in retrospect, I don't think make much sense, and were mostly unnecessary. It tried to address any errors that occurred after `npm i`, but it pasted the command improperly as something like `pm i` (although maybe the AI wasn't at fault there). Ultimately, AI didn't fix what I needed it to fix, and it just dug me further into tools and complications that I didn't understand.

Seeing how AI had failed to help me, I decided that I'd either have to abandon this project, or really get down to business debugging this myself, and learning what I can along the way.

After days of scrolling through config docs, parsing npm error logs, reconfiguring and re-reconfiguring everything, and trying to figure out why Vite was STILL building stuff that used `require()`... I finally updated all of my dependencies to be ES6 compatible. I finally got Tailwind installed. Unfortunately, I put all of this work into just one commit on its own branch, so the work isn't totally reflected in the commit history, but this was by far the hardest part of the project.

Ironic that Tailwind is what slowed me down.

### Eye of the Storm

Now that I *finally* had the basic structure of the app actually set up, it was time to create the chess puzzle part. This ended up being fairly easy compared to what I had just gone through. I first set up a button that links to a random puzzle on Lichess, which I fetched from their API. The hardest part of this was actually making the button open the browser. I had to use inter-process communication to do that, since only the main process has access to OS-level operations like opening the default browser. Additionally, fetching data from within a React component is a different chore, and I ended up using Tanstack Query to manage the task -- which took some time to learn how to implement, and crucially, how to avoid refetching puzzles from the Lichess API unnecessarily. But I got it done in the end.

Next, I wanted to actually integrate shadcn/ui, which I had forgotten to actually do amid dependency hell. Getting Tailwind installed was hard, but installing shadcn/ui afterwards and using its components was actually relatively easy, all things considered.

I made some other minor changes, including adding an icon to my app (which involved learning a little bit about image editing), but the next big challenge was fast approaching.

### Chessground

I had grown dissatisfied with `react-chessboard`. It didn't allow for square highlighting, only arrows; it didn't highlight legal moves, and I don't believe it has that functionality; its documentation uses React class components instead of functional components, so parsing config options from the docs was tiresome; and ultimately, it just didn't feel good to use, in my opinion. In retrospect, maybe there were config options I could have dug into, but instead, I had the idea to use whatever Lichess uses. They're open-source, after all, so I should be able to just modify their chessboard for use in my project, right?

Lichess uses a tool created for their site, called Chessground. It is available as its own npm package, but not as a React component, so I couldn't just drop it in. Luckily, a kind stranger had created a React wrapper for Chessground... but their wrapper used an older version of React, causing a dependency conflict. Instead of dealing with that again, I went with the somewhat crappy solution of manually copying and pasting their code into my project, modifying it a bit, and giving profuse credits both in the file and in the README. Luckily the copy-pasted code still worked. Along the way, I learned quite a bit about best practices regarding licensing, including an automated tool that generates a THIRDPARTY file for all the packages used in the project.

The real problem here, and one of the problems that was the beginning of the end, was that I simply could not figure out how to properly work with Chessground. It's easy enough to pass a config object to it, even through the React wrapper. But knowing what config options there were, and what they would expect, and what they would do, was a maddening process of trial and error... and another error, and maybe success, and then more errors. The Chessground README doesn't show anything like a general guide for how to use the tool. The example repo, listed in the Chessground README, links to GitHub pages that no longer work, using code examples that are organized in a way that I couldn't understand. But the worst part of the whole process was that I needed a way to go from "How do I do this in Chessground" to an actual solution, and nothing seemed set up to solve that. When I tried to query AI tools, hoping that they could parse the information better than me, I got responses that only sometimes worked.

Maybe there were just a bunch of things that I wasn't understanding. But there was nothing in place that I felt I could use to build that understanding.

Regardless, even through that maddening trial-and-error process, I didn't give up. It'd take more than that.

### The Puzzle

My goal was to use Chessground to render chess puzzles, and then allow the user to solve them. I wanted to more or less recreate the Lichess puzzle UI. As mentioned before, each step was a slog. I wanted to make the last move from the opponent play before the user plays a move, but this also messed up the highlighting of the last move of the game. After addressing that, I needed to figure out how to accommodate multiple moves of a puzzle, which involved jockeying React state, chess.js, and Chessground all at the proper times. Once that was working, I had to generate a Map object of all the legal moves in the position, as Chessground expects them, so that legal moves could be properly highlighted. That was actually overall easier, but it involved learning more about TS, since Chessground needs a *typed* Map object. Along the way, I learned more about best practices in TS (thanks in part to the W3Schools TS tutorial).

Later, I recalled that some puzzles actually have multiple solutions, but the Lichess API docs say that this is only possible for mate-in-1 puzzles. However, I later found an example where that was not the case! But I never got around to addressing that, because the next problem was the straw that broke the camel's back.

### Underpromotion

Lichess handles promotion by creating a UI that allows the user to choose between the four promotable pieces: queen, rook, bishop, and knight. I had hoped that Chessground would include this UI, but it didn't! There are third-party packages that could handle this, but -- you guessed it -- the dependencies were out of date. And this time, it wouldn't just be a single file that I'd need to copy and paste.

I was able to implement auto-queening, but some puzzles do require underpromotion (it's a whole category on Lichess). The thought of trying to wrangle another package with out-of-date dependencies, or trying to build one myself, had my head spinning and my motivation plummeting.

### Salt in the Wound

Other things in my personal life collided with this. Without going into detail, my life at this point has been an emotional roller coaster of hopes repeatedly getting created and then shattered out of nowhere. A few of those hopes had just been shattered, and while I'm kinda used to it at this point, I definitely didn't have the capacity to deal with this motivation-draining project while my personal life was going haywire at the same time.

As if that wasn't enough of a nail in the coffin, the Shai-Hulud attack struck, adding extra stress and confusion to the situation. It's clearly time to close the book on this project.

## Takeaways

### General

**Motivation is important for me.** The idea for this project was good in concept, and intriguing enough that I actually still want to do something like it (just not with Electron). But my motivation can only take so much punishment before I have to move to something else.

Tutorial hell isn't great, but neither is jumping feet-first into using dependencies that I don't understand. In the future, **learning the tools first is a must.**

I need to **learn how to deal with packages that use different versions of dependencies from what my project uses.** I'm sure there's best practices for this, but I don't know what they are, and I paid dearly for my ignorance, haha.

AI is good for some things, like conceptual guides or general understanding of popular technologies. Even the overall roadmap I had generated at the start wasn't bad. However, **AI has many shortcomings**, and should be used with caution. Its "knowledge" can be dated, for example.

### Tech-Specific

If I'm going to continue to learn web development, I should understand Tailwind better. shadcn/ui is a good tool though, even without knowing the intricacies of Tailwind.

Switching from `react-chessboard` to Chessground mid-project probably wasn't wise. It would have been better to deeply learn how to use Chessground in a separate test project before trying to implement it willy-nilly in this project.

### Misc.

`git add --patch` is a great command! It pairs well with `git commit -v` to make sure I know exactly what lines I'm committing.

GitHub Issues are a good way to track what I plan on doing/fixing in the future. It even integrates well with VS Code.

Even a failed project can be a type of success, if I learn something from it!