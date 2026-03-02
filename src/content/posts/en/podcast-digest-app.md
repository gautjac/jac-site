---
title: "I Built a Podcast Digest App in One Evening (With AI Doing Most of the Work)"
date: 2026-02-15
excerpt: "I subscribe to 9 podcasts. Most episodes are 30–60 minutes. I don't have 6+ hours a day to listen. So I built something."
tags: ["AI", "podcasts", "building", "productivity", "vibecoding"]
linkedinUrl: "https://www.linkedin.com/in/jac-gautreau-1767a7367/recent-activity/all/"
coverImage: "/images/writing/podcast.jpg"
lang: en
---

I subscribe to 9 podcasts. Most episodes are 30–60 minutes. I don't have 6+ hours a day to listen, so I end up missing things that matter.

So I built something with my AI assistant Charlotte.

**🎧 Deep summaries** — Not just bullet points. Key quotes, guest context, and a "For You" section connecting insights to my specific interests and projects.

**🔊 Audio narration** — Each summary has a TTS audio version (~90 seconds). Perfect for walking the dog or quick catch-ups.

**⏭️ Auto-play** — When one episode ends, it automatically scrolls to the next and starts playing.

**📱 Mobile-first** — Dark mode, clean design, works great on phone.

## The "vibe coding" part

I didn't write most of this code myself. I described what I wanted, Charlotte (Claude via OpenClaw) built it, we iterated together. The whole thing — from "I want a podcast summary site" to live deployment — took a few hours spread over two evenings.

**Tools used:**
- Astro (static site generator)
- Qwen3-TTS (local AI voice synthesis on my Mac Mini)
- Netlify (hosting)
- OpenClaw + Claude (the AI doing the actual work)

This is what "AI-augmented" work looks like in practice. Not replacing creativity — amplifying it. I had the idea and the requirements. AI handled the implementation.

What repetitive information tasks could you automate with AI?
