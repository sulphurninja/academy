/**
 * Seed all lesson guide content into the database.
 * Run: npx tsx scripts/seed-guides.ts
 * Requires MONGODB_URI in .env or .env.local
 */

import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const LessonSchema = new mongoose.Schema(
  {
    weekSlug: String,
    lessonSlug: String,
    title: String,
    summary: String,
    content: String,
    readingTimeMinutes: Number,
    videoUrl: String,
    videoProvider: String,
    durationSeconds: Number,
    resources: [{ label: String, url: String }],
    challenge: String,
    quiz: mongoose.Schema.Types.Mixed,
    xpVideoComplete: { type: Number, default: 50 },
    isPublished: { type: Boolean, default: false },
    authorId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, strict: false }
);
LessonSchema.index({ weekSlug: 1, lessonSlug: 1 }, { unique: true });
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);

interface GuideEntry {
  weekSlug: string;
  lessonSlug: string;
  title: string;
  summary: string;
  content: string;
}

const GUIDES: GuideEntry[] = [
  // ═══════════════════════════════════════════
  // WEEK 0 — Onboarding & ICP lock-in
  // ═══════════════════════════════════════════
  {
    weekSlug: "wk0-onboarding",
    lessonSlug: "welcome-to-zapacademy",
    title: "Welcome to ZapAcademy",
    summary: "Why we built this, how the 8 weeks work, how to win the Showdown.",
    content: `# Welcome to ZapAcademy

You're about to embark on an **8-week journey** that will transform you from a Zaptick user into a full-fledged WhatsApp marketing operator — capable of running campaigns, building automations, deploying AI agents, and even launching your own agency.

## What is ZapAcademy?

ZapAcademy is Zaptick's official learning platform. It's not just a course — it's a **gamified, community-driven accelerator** designed to help you master every feature of the Zaptick platform.

:::highlight
By the end of 8 weeks, you'll have the skills to generate ₹1 Cr/year in revenue using WhatsApp marketing alone.
:::

## How the 8 weeks work

:::steps
- **Weeks 0–1: Foundation** — Get your workspace live, connect your WABA, learn templates and inbox management
- **Weeks 2–3: Build** — Master workflows, AI agents, campaigns, and landing pages
- **Week 4: Demo Day** — Pitch your agency live to a panel of judges
- **Weeks 5–6: Monetize** — Package your services, price them, sign 3 paying clients
- **Week 7: Scale** — Build reporting, referral loops, and hire your first team member
:::

## The XP System

Every action you take earns you **XP (Experience Points)**:

- Watch a video lesson: **+50 XP**
- Pass a quiz: **+100 XP** (perfect score: +250 XP!)
- Post in the community: **+20 XP**
- Comment on a lesson: **+10 XP**
- Complete a challenge: **+400 XP**

:::tip
Climb the leaderboard and unlock rewards like AI credits, wallet credits, and exclusive partner offers at each level!
:::

## The Zaptick Showdown

The **Showdown** is a ₹1,00,000 competition running alongside the cohort. The Top 10 members get co-marketed with Zaptick and split the prize pool.

:::info
Your position on the leaderboard at the end of Week 7 determines your Showdown ranking. Every XP counts!
:::

## What you need to get started

:::checklist
- A Zaptick account on a Growth plan or above
- Access to Meta Business Suite (for WABA connection)
- 4–8 hours per week for lessons, quizzes, and challenges
- An eagerness to learn and help fellow cohort members
:::

:::cta /curriculum Start the curriculum →
:::`,
  },
  {
    weekSlug: "wk0-onboarding",
    lessonSlug: "connect-your-waba",
    title: "Connect your WABA",
    summary: "Hook up Meta Business + WhatsApp Business API in under 10 minutes.",
    content: `# Connect your WABA (WhatsApp Business Account)

Your **WABA** is the bridge between your business and 2 billion WhatsApp users. In this guide, you'll connect Meta Business Suite to Zaptick and go live in under 10 minutes.

## What is a WABA?

A **WhatsApp Business Account** (WABA) is Meta's official way of giving businesses access to the WhatsApp Business API. Unlike the free WhatsApp Business App, the API gives you:

- Unlimited team members in one inbox
- Template messages that reach thousands
- Automations, chatbots, and AI agents
- Analytics and delivery tracking

:::info
You need a **Meta Business Suite** account and a phone number that isn't already registered on WhatsApp. Zaptick handles the rest.
:::

## Step-by-step connection

:::steps
- **Go to Settings → WhatsApp Profile** — In your Zaptick dashboard, navigate to the settings page and click "Connect WABA"
- **Log in to Meta Business Suite** — You'll be redirected to Meta. Sign in with your business Facebook account
- **Create or select a WABA** — If you don't have one, Meta will guide you through creating it. If you do, select the existing one
- **Verify your phone number** — Enter the phone number you want to use. You'll receive a 6-digit code via SMS or call
- **Complete the connection** — Once verified, Zaptick automatically syncs your WABA. You'll see a green "Connected" badge in settings
:::

## Setting up your business profile

Once connected, fill in your **WhatsApp Business Profile** to look professional:

- **Profile picture** — Use your company logo (this becomes your avatar across ZapAcademy too!)
- **Business description** — A clear one-liner about what you do
- **Address** — Your business address
- **Email** — Customer-facing email
- **Website** — Your business website URL

:::tip
A complete business profile increases template approval rates by **40%** according to Meta's own data. Don't skip this!
:::

## Troubleshooting common issues

:::warning
**"Phone number already registered"** — You need to delete your WhatsApp/WhatsApp Business app from the phone with this number before connecting via the API. The same number can't be used in both the app and the API simultaneously.
:::

- **Verification code not arriving?** Try the "Call me" option instead of SMS
- **Meta account suspended?** Contact Meta Business Support directly — Zaptick can't unblock Meta-level bans
- **Wrong WABA selected?** You can disconnect and reconnect from Settings → WhatsApp Profile

:::checklist
- Meta Business Suite account created
- Phone number ready (not on WhatsApp app)
- WABA connected in Zaptick settings
- Business profile picture uploaded
- Business description filled in
:::

:::cta /curriculum/wk0-onboarding/connect-your-waba Watch the video walkthrough →
:::`,
  },
  {
    weekSlug: "wk0-onboarding",
    lessonSlug: "icp-canvas",
    title: "Your ICP, in one canvas",
    summary: "The exact 1-page ICP doc the Top 100 Showdown cohorts shipped.",
    content: `# Your ICP (Ideal Customer Profile), in One Canvas

Before you send a single message, you need to know **exactly who you're talking to**. The ICP Canvas is the foundation everything else is built on — templates, segments, automations, campaigns.

## Why your ICP matters for WhatsApp marketing

:::highlight
Companies with a documented ICP convert **68% more leads** than those who "just wing it." On WhatsApp, where every message costs money, precision isn't optional — it's profitable.
:::

## The Zaptick ICP Canvas

Here's the exact framework our top cohort members use:

### 1. Demographics

- **Industry** — What vertical does your ideal customer operate in?
- **Company size** — Solo, 1–10, 10–50, 50–200, 200+?
- **Revenue range** — What's their annual revenue bracket?
- **Location** — Where are they based?
- **Decision maker** — Who signs the cheque? (Founder, CMO, Head of Marketing?)

### 2. Pain points

List the **top 3 problems** your ideal customer faces that WhatsApp marketing solves:

1. Low response rates on email/SMS
2. Can't scale personalized conversations
3. No automation for lead follow-up

### 3. Current tools

What are they using today that you'll replace or complement?

- Email marketing tools (Mailchimp, Sendinblue)
- SMS gateways
- Manual WhatsApp Business app

### 4. Buying triggers

What events make them ready to buy?

:::steps
- **Scaling pains** — They've outgrown the WhatsApp Business app (max 5 devices)
- **Campaign needs** — They need to send bulk messages for product launches or offers
- **Support overload** — Their inbox is flooded and they need auto-routing + chatbots
- **Competitor pressure** — They see competitors using WhatsApp API and want to catch up
:::

## How to use your ICP in Zaptick

Once you've defined your ICP, you'll use it everywhere in Zaptick:

- **Contact segments** — Filter contacts by ICP attributes using Zaptick's segment builder
- **Template messaging** — Write templates that speak directly to their pain points
- **Workflow triggers** — Set up automations based on ICP-matching behavior
- **AI agent training** — Give your AI agent context about who it's talking to

:::tip
Save your ICP Canvas in the **Notes** section of each lesson. You'll reference it repeatedly throughout the program.
:::

:::pro-tip
Use Zaptick's built-in **ICP tool** at \`/icp\` to generate and refine your ideal customer profile with AI assistance!
:::

:::cta /curriculum/wk0-onboarding/icp-canvas Complete the ICP challenge →
:::`,
  },
  {
    weekSlug: "wk0-onboarding",
    lessonSlug: "set-up-team-inbox",
    title: "Configure your team inbox",
    summary: "Routing, agents, SLAs, working hours. Sub-2-min reply baseline.",
    content: `# Configure Your Team Inbox

Your inbox is the **command center** of your WhatsApp operations. In this guide, you'll set up routing rules, agent assignments, SLAs, and working hours to achieve a sub-2-minute reply time.

## Understanding Zaptick's inbox

Zaptick's inbox at \`/conversations\` is a unified view of all your WhatsApp conversations. Think of it as a shared team email inbox, but for WhatsApp — with superpowers.

:::info
Every message from every customer lands in one place. No more checking individual phones. No more lost conversations.
:::

## Setting up your inbox

:::steps
- **Navigate to Settings → Inbox Settings** — Or go directly to \`/automations/inbox-settings\`
- **Add team members** — Invite your team by email. Each member gets their own login and can handle conversations simultaneously
- **Set working hours** — Define when your team is available. Outside these hours, customers get an auto-reply
- **Configure auto-assignment** — Choose between round-robin (even distribution) or tag-based (specialized routing)
- **Set SLA targets** — Define your target first-response time (aim for under 2 minutes!)
:::

## Routing strategies

### Round-robin assignment
Messages are evenly distributed across all online agents. Best for general support teams.

### Tag-based routing
Route conversations based on contact tags or keywords. For example:
- Contacts tagged "VIP" → Senior agent
- Messages containing "billing" → Finance team
- New leads → Sales team

### Business hours fallback
When the team is offline, Zaptick can:
- Send a custom "we'll be back" message
- Hand off to an AI chatbot
- Collect the customer's query for morning follow-up

:::tip
Set up a **24/7 AI agent** as your after-hours fallback. It can answer FAQs, collect information, and create tickets — all while your team sleeps. You'll learn how in Week 2!
:::

## Quick replies and saved responses

Navigate to \`/settings/quick-replies\` to create a library of canned responses your team can use:

- **Greeting** — "Hi! Thanks for reaching out to [Company]. How can I help?"
- **Pricing** — "Great question! Here's a link to our pricing..."
- **Follow-up** — "Just checking in — did you get a chance to review our proposal?"

:::pro-tip
Top-performing teams maintain a library of **30+ quick replies** covering every common scenario. This alone can cut response time by 60%.
:::

## Measuring inbox performance

Key metrics to track in \`/analytics\`:

- **First response time** — Aim for under 2 minutes
- **Resolution time** — How long until the conversation is closed
- **Messages per conversation** — Lower is better (means efficient resolution)
- **Agent utilization** — Are conversations evenly distributed?

:::checklist
- Team members invited and logged in
- Working hours configured
- Auto-assignment rules set (round-robin or tag-based)
- Quick replies library created (at least 10 responses)
- After-hours auto-reply message written
- SLA target set (sub-2-minute first response)
:::`,
  },
  {
    weekSlug: "wk0-onboarding",
    lessonSlug: "founder-call-rituals",
    title: "Founder call rituals",
    summary: "How weekly founder calls work, what to bring, how to extract maximum value.",
    content: `# Founder Call Rituals

Every week, the ZapAcademy cohort has a **live founder call** — a direct line to the founding team at Zaptick. These calls are where breakthroughs happen.

## How the calls work

- **Frequency**: Weekly, same day and time
- **Duration**: 60 minutes (30 min presentation + 30 min Q&A)
- **Format**: Live on Zoom/Google Meet, recorded for replay
- **Who's there**: Zaptick co-founders + guest experts

:::highlight
95% of Showdown winners cite the founder calls as the single most valuable part of the program. Don't skip them.
:::

## What to bring to every call

:::checklist
- Your **biggest blocker** from the past week — come ready to ask for help
- Your **top win** — sharing wins builds momentum for the whole cohort
- A **specific question** — vague questions get vague answers. Be precise
- Your **screen ready to share** — the best coaching happens when we can see your setup
- **Notes from previous calls** — reference earlier advice and share progress
:::

## How to extract maximum value

### Before the call

:::steps
- **Review your week's progress** — What did you ship? What's stuck?
- **Draft 1–2 specific questions** — "How do I increase my template approval rate for promotional messages?" beats "How do I use templates?"
- **Check the community** — See if someone already asked your question in the feed
:::

### During the call

- **Unmute and ask** — Don't be shy. The call is for you
- **Take notes** — Write down action items in real-time using the Notes tab on your current lesson
- **Screen-share when possible** — 90% of problems are solved in 30 seconds once we can see your screen

### After the call

- **Post your key takeaway** in the community feed within 24 hours
- **Implement at least 1 thing** you learned before the next call
- **Follow up** on any open questions in the community

:::tip
Set a calendar reminder 15 minutes before each call. Use that time to review your questions and open Zaptick so you're ready to screen-share if needed.
:::

## The "1-1-1" rule

After every founder call, commit to:

1. **1 action item** you'll complete before the next call
2. **1 community post** sharing what you learned
3. **1 person you'll help** in the community this week

:::pro-tip
Members who follow the 1-1-1 rule consistently rank **3x higher** on the leaderboard by Week 8. It compounds.
:::`,
  },

  // ═══════════════════════════════════════════
  // WEEK 1 — Inbox + conversations on autopilot
  // ═══════════════════════════════════════════
  {
    weekSlug: "wk1-conversations",
    lessonSlug: "templates-101",
    title: "Templates 101 — what gets approved",
    summary: "The 8 patterns Meta loves and the 4 it kills. Live walkthrough of approval.",
    content: `# Templates 101 — What Gets Approved

WhatsApp templates are your **golden ticket** to proactive outreach. Unlike regular messages (which require the customer to message you first), templates let you start conversations at scale. But Meta guards this gate carefully.

## What are WhatsApp templates?

Templates are **pre-approved message formats** that you submit to Meta for review. Once approved, you can send them to any contact — even outside the 24-hour messaging window.

:::info
There are three categories: **Utility** (order updates, appointment reminders), **Marketing** (promotions, offers), and **Authentication** (OTPs, verification codes). Each has different approval criteria and pricing.
:::

## The 8 patterns Meta loves

:::steps
- **Order confirmation** — "Hi {{1}}, your order #{{2}} has been confirmed! Track it here: {{3}}"
- **Appointment reminder** — "Reminder: Your appointment with {{1}} is tomorrow at {{2}}. Reply CONFIRM or RESCHEDULE"
- **Shipping update** — "Good news! Your package is on its way. Expected delivery: {{1}}"
- **Payment receipt** — "Payment of ₹{{1}} received. Transaction ID: {{2}}. Thank you!"
- **Welcome message** — "Welcome to {{1}}! Here's what you can expect from us..."
- **Feedback request** — "How was your recent experience with {{1}}? Tap below to share feedback"
- **Re-engagement** — "We miss you! Here's 15% off your next order. Use code: {{1}}"
- **Event invitation** — "You're invited! {{1}} is happening on {{2}}. Reserve your spot →"
:::

## The 4 patterns that get rejected

:::warning
- **Pure spam** — "BUY NOW!!! 90% OFF!!!" — No value, all hype
- **Misleading content** — Templates that promise things you can't deliver
- **Missing opt-out** — Every marketing template MUST include an unsubscribe option
- **Sensitive content** — Alcohol, gambling, political content, or adult material
:::

## Creating your first template in Zaptick

Navigate to \`/templates\` and click **Create Template**:

1. **Choose a category** — Start with Utility (highest approval rate)
2. **Write your header** — Optional. Can be text, image, video, or document
3. **Write your body** — Use \`{{1}}\`, \`{{2}}\` etc. for dynamic variables
4. **Add buttons** — Quick Reply or Call-to-Action (URL or phone number)
5. **Add a footer** — Small text at the bottom (great for "Reply STOP to opt out")
6. **Submit for review** — Meta typically reviews within 24–48 hours

:::tip
Use Zaptick's **Template Library** at \`/templates/library\` for pre-built, high-approval-rate templates you can customize in seconds!
:::

## Approval timeline

- **Utility templates**: Usually approved within 1–4 hours
- **Marketing templates**: 12–48 hours
- **Authentication templates**: 1–2 hours

:::pro-tip
Submit templates during **Indian/US business hours** (9 AM – 5 PM IST). Meta's review team is most active then, and you'll get faster approvals.
:::

:::checklist
- Understood the 3 template categories
- Created at least 1 Utility template
- Created at least 1 Marketing template with opt-out footer
- Explored the Template Library for pre-built options
- Submitted templates for Meta approval
:::`,
  },
  {
    weekSlug: "wk1-conversations",
    lessonSlug: "compose-utility-template",
    title: "Compose your first utility template",
    summary: "Variables, buttons, footers, headers — every knob explained.",
    content: `# Compose Your First Utility Template

Time to get hands-on. In this guide, you'll create a **production-ready utility template** — learning every component along the way.

## Anatomy of a WhatsApp template

Every template has up to 4 components:

### Header (optional)
The top section. Can be:
- **Text** — A bold title line with 1 variable max
- **Image** — A product photo, banner, or logo
- **Video** — A short clip (up to 16MB)
- **Document** — A PDF invoice, receipt, etc.

### Body (required)
The main message content. Supports:
- **Variables**: \`{{1}}\`, \`{{2}}\`, etc. — replaced with actual data when sending
- **Bold**: \`*text*\`
- **Italic**: \`_text_\`
- **Strikethrough**: \`~text~\`
- **Monospace**: \`\`\`text\`\`\`

### Footer (optional)
Small gray text at the bottom. Perfect for:
- "Reply STOP to unsubscribe"
- "Powered by YourCompany"
- Terms and conditions links

### Buttons (optional, max 3)
- **Quick Reply** — Pre-filled reply buttons (e.g., "Confirm", "Cancel")
- **Call to Action: URL** — Opens a link
- **Call to Action: Phone** — Initiates a call

## Let's build: Order Confirmation Template

:::steps
- **Open the template editor** — Go to \`/templates\` → "Create Template"
- **Name it** — Use a descriptive name: \`order_confirmation_v1\`
- **Category** — Select **Utility**
- **Language** — Choose your primary language (you can add translations later)
- **Header** — Select "Image" and use a placeholder (your brand logo)
- **Body** — Type: "Hi {{1}}, your order **#{{2}}** has been confirmed! 🎉\\n\\nItems: {{3}}\\nTotal: ₹{{4}}\\n\\nExpected delivery: {{5}}\\n\\nTrack your order anytime by clicking below."
- **Footer** — "Thank you for shopping with us!"
- **Button** — Add a URL button: "Track Order" → \`https://yoursite.com/track/{{1}}\`
- **Submit** — Click "Submit for Review"
:::

:::tip
Always include **sample values** for your variables when submitting. Meta uses them to understand context. Example: {{1}} = "Rahul", {{2}} = "ORD-4521"
:::

## Variable best practices

- Keep variables **short and predictable** — Don't stuff entire paragraphs into variables
- Variables in the header support only **1 variable max**
- URL buttons support **1 dynamic variable** at the end of the URL
- Quick reply buttons are **static** — they can't contain variables

:::warning
**Never put the entire message in variables.** Meta will reject templates where variables make up more than 50% of the body. The static text must clearly convey the purpose.
:::

## Testing your template

Once approved, test it before going live:

1. Go to \`/conversations\`
2. Open a conversation with your own number
3. Click "Template" and select your new template
4. Fill in the variable values
5. Send and verify it looks right on your phone

:::pro-tip
Create a **contact group** called "Test Numbers" with your team's personal numbers. Use this group to preview every template before broadcast.
:::`,
  },
  {
    weekSlug: "wk1-conversations",
    lessonSlug: "auto-routing-rules",
    title: "Auto-routing rules",
    summary: "Tag-based assignment, round-robin, business hours fallbacks.",
    content: `# Auto-routing Rules

The difference between a chaotic inbox and a well-oiled machine? **Routing rules.** Set them up once, and every conversation lands in the right hands automatically.

## Why routing matters

:::highlight
Teams with auto-routing respond **4x faster** than teams without it. Speed = sales on WhatsApp.
:::

## Types of routing in Zaptick

### 1. Round-robin
Messages are distributed evenly across all available agents. Best when:
- All agents have the same skill set
- You want fair workload distribution
- Volume is predictable

### 2. Tag-based routing
Route conversations based on contact attributes or message content:

- Contacts tagged \`VIP\` → Senior sales rep
- Contacts tagged \`support\` → Support team
- Messages containing "refund" → Finance team
- New contacts (no tags) → Lead qualification agent

### 3. Keyword-based routing
Automatically detect keywords in incoming messages and route accordingly:

- "price" / "cost" / "plan" → Sales
- "help" / "issue" / "problem" → Support
- "invoice" / "payment" / "billing" → Finance

## Setting up routing rules

:::steps
- **Go to Automations → Inbox Settings** — Navigate to \`/automations/inbox-settings\`
- **Enable auto-assignment** — Toggle on automatic conversation assignment
- **Choose your strategy** — Round-robin for simplicity, or tag-based for precision
- **Define rules** — For tag-based: create rules matching tags to specific agents or teams
- **Set fallback** — What happens when no rule matches? Assign to a "General" queue or a specific agent
- **Save and test** — Send a test message and verify it lands with the right person
:::

:::tip
Start with **round-robin** if you have a small team (under 5 agents). Switch to tag-based as your team grows and specializes.
:::

## Business hours and after-hours handling

Configure what happens when your team is offline:

- **Auto-reply message** — "Thanks for reaching out! Our team is available Mon–Sat, 9 AM – 6 PM IST. We'll get back to you first thing!"
- **Chatbot handoff** — Route to an AI chatbot that can handle basic queries
- **Ticket creation** — Log the conversation as a ticket for morning follow-up

:::pro-tip
Combine routing with **labels** in Zaptick. When an agent resolves a conversation, they add a label (e.g., "resolved," "needs-followup," "upsell-opportunity"). This creates a feedback loop that helps you optimize routing rules over time.
:::

:::checklist
- Auto-assignment enabled in inbox settings
- Routing strategy chosen (round-robin or tag-based)
- At least 3 routing rules configured
- Business hours defined
- After-hours auto-reply message written
- Fallback agent/queue assigned
:::`,
  },
  {
    weekSlug: "wk1-conversations",
    lessonSlug: "saved-replies-canned",
    title: "Saved replies & canned scripts",
    summary: "Build a library every agent can use to never type the same line twice.",
    content: `# Saved Replies & Canned Scripts

Every time an agent types the same response from scratch, your business loses money. **Saved replies** (also called quick replies or canned responses) are pre-written messages your team can send with a single click.

## Why saved replies matter

- **Speed**: 3-second response vs. 30-second typing
- **Consistency**: Every customer gets the same quality response
- **Training**: New agents are instantly effective
- **Scale**: Handle 3x more conversations per agent

:::highlight
Teams using saved replies handle an average of **47 more conversations per day** per agent. That's the difference between 2 support hires and 5.
:::

## Building your saved reply library

Navigate to \`/settings/quick-replies\` in Zaptick. Here are the essential categories:

### Greetings (5 minimum)
- General welcome
- Returning customer welcome
- After-hours greeting
- Holiday greeting
- Escalation acknowledgment

### Sales (10 minimum)
- Pricing inquiry response
- Product feature explanation
- Demo booking link
- Proposal follow-up
- Discount/offer sharing
- Payment link sending
- Upsell/cross-sell
- Testimonial sharing
- Trial extension
- Competitor comparison

### Support (10 minimum)
- Troubleshooting start
- "Can you share a screenshot?"
- Issue escalation notice
- Resolution confirmation
- Feedback request
- Refund process explanation
- Account verification
- Technical documentation link
- Service status update
- Closing/satisfaction check

:::tip
Use **variables** in your saved replies! Zaptick supports \`{{contact.name}}\`, \`{{contact.company}}\`, and other dynamic fields so your canned responses still feel personal.
:::

## Organizing with categories

Group your replies into folders:
- 🟢 Greetings
- 💰 Sales
- 🔧 Support
- 📋 Orders
- 💳 Billing
- 📣 Marketing

## Keyboard shortcuts

In Zaptick's inbox, type \`/\` followed by a keyword to instantly search your saved replies. For example:
- \`/price\` → Shows all pricing-related replies
- \`/greeting\` → Shows all greeting templates
- \`/refund\` → Shows the refund process reply

:::pro-tip
Review your saved replies **monthly**. Remove ones that aren't being used, update ones that feel stale, and add new ones for recurring questions you notice. Your library should be a living document.
:::

:::checklist
- At least 25 saved replies created
- Replies organized into categories
- Variables used for personalization
- Team trained on the \`/\` shortcut
- Monthly review calendar reminder set
:::`,
  },
  {
    weekSlug: "wk1-conversations",
    lessonSlug: "voice-notes-stickers",
    title: "Voice notes & stickers — the 3× engagement unlock",
    summary: "How to use rich media inside conversations to 3× engagement.",
    content: `# Voice Notes & Stickers — The 3× Engagement Unlock

Text messages are fine. But WhatsApp is a **rich media platform** — and the businesses that treat it like one see dramatically higher engagement.

## The engagement multiplier effect

:::highlight
Messages with rich media (images, voice notes, stickers) get **3× higher response rates** than plain text on WhatsApp. This isn't a guess — it's data from 10,000+ Zaptick conversations.
:::

## Types of rich media in Zaptick

### Voice notes
Record and send voice messages directly from the inbox. Perfect for:
- Personal touch on high-value deals
- Explaining complex solutions
- Building rapport with key accounts
- Conveying tone and enthusiasm (text can't do this!)

### Stickers
Zaptick supports custom **sticker packs** (create them at \`/settings/sticker-packs\`):
- Brand-specific reaction stickers
- Celebration stickers for closed deals
- Support stickers for common resolutions

### Images & Videos
- Product photos with annotations
- Quick screen recordings for support
- Infographics summarizing key info
- Behind-the-scenes team photos (humanizes your brand)

### Documents
- PDF proposals and quotes
- Invoices and receipts
- Catalogs and lookbooks
- Contracts and agreements

## When to use which format

| Scenario | Best Format |
|----------|------------|
| First response to a lead | Voice note (personal touch) |
| Product showcase | Image carousel or video |
| Order confirmation | Template with PDF attachment |
| Support troubleshooting | Screen recording |
| Celebrating a win with client | Custom sticker |
| Sharing pricing | PDF document |

:::tip
**Voice notes for sales, stickers for support.** Sales conversations need the personal warmth of voice. Support conversations need the efficiency and fun of visual reactions.
:::

## Creating a sticker pack

:::steps
- **Go to Settings → Sticker Packs** — Navigate to the sticker management page
- **Create a new pack** — Name it after your brand
- **Upload stickers** — PNG files with transparent backgrounds, 512×512px recommended
- **Categories** — Create stickers for: greetings, celebrations, acknowledgments, and fun reactions
- **Deploy** — Your team can now use these stickers directly from the inbox
:::

:::pro-tip
Commission a designer on Fiverr to create **20 custom branded stickers** for under ₹2,000. It's a tiny investment that makes your brand unforgettable in the customer's chat list.
:::

:::checklist
- Practiced sending voice notes from the Zaptick inbox
- Created at least 1 custom sticker pack
- Shared an image with annotation in a test conversation
- Team briefed on when to use each rich media type
:::`,
  },

  // ═══════════════════════════════════════════
  // WEEK 2 — Workflows + AI agents shipped
  // ═══════════════════════════════════════════
  {
    weekSlug: "wk2-workflows",
    lessonSlug: "workflow-builder-fundamentals",
    title: "Workflow builder fundamentals",
    summary: "Triggers, actions, branching, delays, error handling.",
    content: `# Workflow Builder Fundamentals

Workflows are the **automation engine** of Zaptick. They let you build "if this, then that" logic that runs 24/7 — without any coding.

## What is a workflow?

A workflow is a visual automation that:
1. **Starts** when something happens (a trigger)
2. **Does things** automatically (actions)
3. **Makes decisions** based on data (conditions/branches)
4. **Waits** when needed (delays)

:::highlight
The average Zaptick power user runs **9 active workflows** that handle everything from lead qualification to order updates to win-back campaigns.
:::

## Core concepts

### Triggers
What starts the workflow:
- **New message received** — Someone sends you a WhatsApp message
- **Contact created** — A new contact is added to your CRM
- **Tag added** — A specific tag is applied to a contact
- **Template replied** — Someone responds to a template message
- **Webhook** — An external system sends data to Zaptick
- **Schedule** — Run at a specific time (daily, weekly, etc.)

### Actions
What the workflow does:
- **Send message** — Text, image, video, document, or template
- **Add/remove tag** — Organize contacts automatically
- **Assign to agent** — Route to a specific team member
- **Update contact** — Change contact fields (name, email, etc.)
- **HTTP request** — Call external APIs
- **Send email** — Trigger an email via Zaptick's email channel
- **Create ticket** — Log a support ticket

### Conditions (branches)
Make decisions:
- **If/else** — "If contact has tag 'VIP', send premium reply. Else, send standard reply."
- **Switch** — Multiple branches based on a value
- **Wait for reply** — Pause until the contact responds

### Delays
Control timing:
- **Wait X minutes/hours/days** — Add a pause between actions
- **Wait until** — Pause until a specific time (e.g., "next business day at 9 AM")

## Building your first workflow

:::steps
- **Navigate to Automations → Workflows** — Go to \`/automations/workflows\`
- **Click "Create Workflow"** — Give it a descriptive name
- **Choose your trigger** — Start with "New message received"
- **Add a condition** — Check if the message contains a keyword (e.g., "pricing")
- **Add an action** — Send an auto-reply with your pricing info
- **Add a fallback** — For messages that don't match, assign to an agent
- **Test it** — Use the built-in test mode before going live
- **Activate** — Toggle the workflow to "Active"
:::

:::warning
Always add an **error handling path** to your workflows. If an HTTP request fails or a template send bounces, you don't want the workflow to silently fail.
:::

:::tip
Start with **simple, 3-step workflows** and expand them over time. A working simple workflow beats a broken complex one every time.
:::`,
  },
  {
    weekSlug: "wk2-workflows",
    lessonSlug: "build-your-first-workflow",
    title: "Build your first workflow — abandoned-cart recovery",
    summary: "Live build inside Zaptick's actual workflow canvas. Ship it.",
    content: `# Build Your First Workflow — Abandoned Cart Recovery

Let's build a real workflow that makes real money: **abandoned cart recovery**. This workflow automatically messages customers who added items to their cart but didn't complete checkout.

## Why abandoned cart recovery?

:::highlight
The average e-commerce store loses **70% of carts** to abandonment. A well-timed WhatsApp reminder recovers **15–25%** of those carts. For a store doing ₹10L/month, that's ₹1.5–2.5L in recovered revenue.
:::

## The workflow blueprint

Here's the complete flow:

:::steps
- **Trigger: Webhook from Shopify** — When a checkout is abandoned, Shopify sends a webhook to Zaptick (set up in \`/integrations/shopify\`)
- **Delay: Wait 30 minutes** — Give the customer time to come back on their own
- **Condition: Check if order was completed** — Query Shopify via HTTP request to see if they purchased
- **If NOT purchased → Send reminder #1** — A friendly template: "Hey {{name}}, you left some items in your cart! Complete your order and get free shipping 🚚"
- **Delay: Wait 4 hours** — Don't be too aggressive
- **Condition: Check again** — Did they purchase?
- **If NOT purchased → Send reminder #2** — Add urgency: "Your cart is about to expire! Items are selling fast. Complete your order before they're gone →"
- **Delay: Wait 24 hours** — Final chance
- **If NOT purchased → Send final offer** — "Last chance! Here's 10% off to complete your order. Use code COMEBACK10 at checkout"
- **Tag the contact** — Add "cart-abandoned-sequence-complete" so they don't get re-enrolled
:::

## Setting up the Shopify integration

Before building the workflow, connect Shopify:

1. Go to \`/integrations/shopify\`
2. Click "Connect Store"
3. Enter your Shopify store URL
4. Authorize Zaptick to read orders and cart data
5. Enable the "Abandoned Checkout" webhook

:::tip
If you're not on Shopify, the same logic works with **any e-commerce platform** using Zaptick's webhook trigger. WooCommerce, Razorpay, or your custom store can all send webhooks.
:::

## Template messages for the sequence

Create 3 templates in \`/templates\`:

**Reminder 1 (Utility):**
> Hi {{1}}! 👋 You left some great items in your cart at {{2}}. Your cart is saved and ready when you are. Tap below to complete your order!

**Reminder 2 (Marketing):**
> Hey {{1}}, just a heads up — your cart items at {{2}} are going fast! 🔥 Don't miss out. Complete your purchase →

**Reminder 3 (Marketing):**
> Last chance, {{1}}! Here's an exclusive **10% off** your cart at {{2}}. Use code: {{3}} at checkout. Offer expires in 24 hours ⏰

:::warning
Make sure your marketing templates include an **opt-out option** in the footer. "Reply STOP to unsubscribe" is sufficient.
:::

## Measuring success

After your workflow has been running for a week, check:
- **Recovery rate** — % of abandoned carts that converted
- **Revenue recovered** — Total ₹ from recovered carts
- **Opt-out rate** — If too high (>5%), reduce frequency
- **Best-performing message** — Which of the 3 reminders converts most?

:::pro-tip
The **30-minute first reminder** is the sweet spot. Sending too early (under 10 minutes) feels stalkerish. Sending too late (over 2 hours) means they've already forgotten.
:::`,
  },
  {
    weekSlug: "wk2-workflows",
    lessonSlug: "ai-agents-fundamentals",
    title: "AI agents — when to use, when not to",
    summary: "Routing AI vs. orchestrating AI vs. answering AI. Pick the right shape.",
    content: `# AI Agents — When to Use, When Not To

AI agents are the most powerful feature in Zaptick — and the most misused. This guide helps you understand the **three types of AI** and when each one is appropriate.

## The three types of AI in Zaptick

### 1. Answering AI (FAQ Bot)
**What it does**: Answers customer questions using your knowledge base.
**Best for**: 24/7 customer support, product information, policy questions.
**Don't use for**: Complex sales conversations, sensitive issues, escalations.

### 2. Routing AI (Smart Triage)
**What it does**: Understands the intent of incoming messages and routes them to the right team/workflow.
**Best for**: High-volume inboxes where conversations need intelligent sorting.
**Don't use for**: Actually resolving issues (it just routes, doesn't answer).

### 3. Orchestrating AI (Agent Assist)
**What it does**: Suggests responses to human agents, auto-fills data, and handles routine sub-tasks within a conversation.
**Best for**: Augmenting your team's speed without replacing the human touch.
**Don't use for**: Fully automated customer-facing interactions (keep a human in the loop).

:::highlight
The winning formula? **Answering AI for support + Routing AI for inbox management + Orchestrating AI for sales.** Layer them, don't choose just one.
:::

## When to use AI vs. humans

| Scenario | AI or Human? | Why? |
|----------|-------------|------|
| FAQ questions | AI | Instant, consistent, scalable |
| Complex complaints | Human | Empathy required |
| Lead qualification | AI → Human | AI qualifies, human closes |
| Order status checks | AI | Data lookup, no judgment needed |
| Price negotiation | Human | Nuance, relationship |
| After-hours coverage | AI | 24/7 availability |
| Onboarding walkthroughs | AI + Human | AI for steps, human for questions |

:::warning
**Never use AI for**: Refund approvals, legal/compliance topics, medical/health advice, or any situation where getting it wrong has serious consequences. AI should assist, not decide, in high-stakes scenarios.
:::

## Setting up your first AI agent

:::steps
- **Go to the AI Agent page** — Navigate to \`/ai-agent\`
- **Create a new agent** — Give it a name and persona (e.g., "Support Bot" with a friendly, professional tone)
- **Upload your knowledge base** — PDFs, FAQs, website content, product docs. The more context, the better
- **Set boundaries** — Define what the agent can and cannot do. "You can answer questions about our products and policies. You cannot process refunds or make promises about pricing"
- **Configure escalation** — When the AI is unsure (confidence < 70%), hand off to a human agent
- **Test extensively** — Ask it edge cases, trick questions, and common queries before going live
:::

:::tip
Your AI agent is only as good as its **knowledge base**. Spend 2 hours curating your best documentation, FAQs, and product information. This investment pays for itself within the first week.
:::

:::pro-tip
Use the **AI Agent's analytics** to identify questions it can't answer well. Then update the knowledge base to cover those gaps. Within 2 weeks of this feedback loop, your bot will handle 80%+ of conversations autonomously.
:::`,
  },
  {
    weekSlug: "wk2-workflows",
    lessonSlug: "deploy-faq-agent",
    title: "Deploy a 24/7 FAQ agent",
    summary: "From knowledge base → embeddings → agent live in 20 minutes.",
    content: `# Deploy a 24/7 FAQ Agent

In this lesson, you'll go from zero to a fully functional AI FAQ agent that handles customer queries around the clock. Total time: **20 minutes**.

## What you'll build

A WhatsApp AI agent that:
- Answers common customer questions instantly
- Works 24/7, including holidays and weekends
- Escalates complex issues to your team
- Learns and improves from every conversation

## Step-by-step deployment

:::steps
- **Prepare your knowledge base** — Gather your top 50 FAQs, product documentation, pricing page, return policy, and shipping information into documents (PDF, DOCX, or plain text)
- **Navigate to AI Agent** — Go to \`/ai-agent\` in your Zaptick dashboard
- **Create a new agent** — Name: "24/7 Support Bot" · Tone: "Friendly and professional" · Language: Match your audience
- **Upload knowledge base** — Drag and drop your documents. Zaptick will automatically create embeddings (vector representations of your content)
- **Configure the system prompt** — "You are a helpful customer support agent for [Company Name]. Answer questions based on the knowledge base provided. If you're unsure or the question is about refunds/billing, say: 'Let me connect you with a team member who can help with that right away!'"
- **Set escalation rules** — Confidence threshold: 70%. Below that, hand off to human agent. Also escalate on keywords: "refund", "complaint", "manager", "legal"
- **Connect to inbox** — In Automations → Inbox Settings, set this agent as the **first responder** for new conversations
- **Test with 10 questions** — Ask it your most common questions. Check accuracy. Tweak the knowledge base where needed
- **Go live!** — Toggle the agent to "Active"
:::

## Writing an effective system prompt

Your system prompt is the AI's **personality and rulebook**. Here's a template:

> You are [Bot Name], a customer support assistant for [Company].
> 
> Your job: Answer customer questions using the knowledge base. Be concise, friendly, and helpful.
> 
> Rules:
> - Never make up information. If unsure, escalate to a human
> - Always greet the customer by name if available
> - Keep responses under 3 paragraphs
> - Use emojis sparingly (1-2 per message max)
> - For pricing questions, share the link: [pricing URL]
> - For refunds or complaints, immediately escalate

:::tip
Test your agent with **adversarial questions** — things it should NOT answer. Ask it to generate code, write poetry, or discuss politics. Make sure it stays on-topic and redirects gracefully.
:::

## Measuring your agent's performance

After 1 week, check these metrics:

- **Deflection rate** — % of conversations resolved without human intervention (target: 60%+)
- **Accuracy** — Review a random sample of 20 AI responses for correctness
- **Escalation rate** — How often does it hand off? (target: under 40%)
- **Customer satisfaction** — Add a quick "Was this helpful? 👍/👎" after AI responses

:::pro-tip
The **80/20 rule** applies: 80% of customer queries come from 20% of topics. Nail those 20% in your knowledge base first, and your agent will feel magical from day one.
:::

:::checklist
- Knowledge base prepared (50+ FAQs, product docs, policies)
- AI agent created with name and persona
- System prompt written and tested
- Escalation rules configured (confidence threshold + keywords)
- Agent connected to inbox as first responder
- Tested with 10+ common questions
- Agent set to "Active"
:::`,
  },
  {
    weekSlug: "wk2-workflows",
    lessonSlug: "measure-deflection",
    title: "Measure deflection & escalations",
    summary: "The 4 numbers that prove your bot is paying for itself.",
    content: `# Measure Deflection & Escalations

You've deployed your AI agent. Now prove it's working — with data. These are the **4 numbers** that prove your bot is paying for itself.

## The 4 metrics that matter

### 1. Deflection Rate
**What it is**: The percentage of conversations fully resolved by the AI without human involvement.
**Target**: 60–80% for a well-tuned agent.
**Formula**: (AI-resolved conversations / Total conversations) × 100

### 2. First Response Time
**What it is**: How quickly a customer gets their first reply.
**Target**: Under 5 seconds for AI, under 2 minutes for human.
**Why it matters**: 82% of customers expect an immediate response on messaging platforms.

### 3. Escalation Rate
**What it is**: How often the AI hands off to a human.
**Target**: 20–40% (some conversations should escalate — that's healthy).
**Red flag**: Over 50% means your knowledge base needs work. Under 10% means your bot might be answering things it shouldn't.

### 4. Cost Per Resolution
**What it is**: How much each resolved conversation costs.
**Formula**: (AI costs + human agent salary for escalated conversations) / Total conversations resolved
**Target**: 80% lower than human-only support

:::highlight
A well-tuned Zaptick AI agent saves the average business **₹2.5L per month** in support costs while improving customer satisfaction scores by 15%.
:::

## Where to find these metrics

In Zaptick, navigate to \`/analytics\` and look for:
- **Conversation analytics** — Overall volume, resolution times, agent performance
- **AI agent dashboard** — Specific AI metrics, confidence scores, topic breakdown
- **Agent comparison** — Side-by-side: AI vs. human response times and satisfaction

## The weekly review ritual

Every Monday morning, spend 15 minutes on this:

:::steps
- **Check deflection rate** — Is it trending up? If not, identify the top 5 questions the AI couldn't answer and add them to the knowledge base
- **Review escalations** — Read 5 random escalated conversations. Was the escalation necessary? If not, tweak the escalation rules
- **Check accuracy** — Pick 10 random AI responses. Were they correct and helpful? Mark any issues
- **Update knowledge base** — Add new information for any gaps you identified
- **Document learnings** — Post a quick update in the ZapAcademy community
:::

:::tip
Create a \`#bot-improvements\` channel in your team's communication tool. Encourage agents to flag every AI mistake they see. Each fix makes the bot permanently better.
:::

## The ROI calculation

Here's how to present the value to stakeholders:

**Before AI agent:**
- 3 support agents × ₹30,000/month = ₹90,000
- Average response time: 12 minutes
- Conversations handled: 50/day

**After AI agent:**
- 1 support agent + AI = ₹35,000/month (agent salary + AI costs)
- Average response time: 8 seconds (AI) / 2 minutes (escalated)
- Conversations handled: 200/day

**Monthly savings: ₹55,000**
**Annual savings: ₹6,60,000**

:::pro-tip
Document this ROI calculation for your own business. You'll need it in Week 5 when you package and price your agency services.
:::`,
  },

  // ═══════════════════════════════════════════
  // WEEK 3 — Campaigns + landing pages
  // ═══════════════════════════════════════════
  {
    weekSlug: "wk3-campaigns",
    lessonSlug: "broadcast-strategy",
    title: "Broadcast strategy — what actually works",
    summary: "Frequency caps, segments, send times, the 'one-message rule'.",
    content: `# Broadcast Strategy — What Actually Works

Broadcasts are the most powerful revenue driver in WhatsApp marketing — and the easiest way to get your number blocked. This guide teaches you the strategy that separates high-performers from spammers.

## The one-message rule

:::highlight
If you could only send **one message per week** to each contact, what would it say? Answer that question, and you've found your broadcast strategy.
:::

## Frequency that works

- **Marketing broadcasts**: Max 2–3 per week per contact
- **Utility updates**: As needed (order updates, appointment reminders)
- **Re-engagement**: Once every 2 weeks for inactive contacts
- **Seasonal campaigns**: Plan 4–6 weeks ahead

:::warning
Sending more than 4 marketing messages per week to the same contact will **tank your quality rating** with Meta. Your number could get flagged, throttled, or blocked entirely. Less is more.
:::

## Segment, don't spray

The #1 mistake in WhatsApp marketing: sending the same message to everyone. Instead:

- **By purchase history** — Repeat buyers get VIP offers; first-timers get educational content
- **By engagement** — Active contacts get new product alerts; dormant contacts get re-engagement
- **By location** — Local offers for local customers
- **By lifecycle stage** — Leads get nurture content; customers get loyalty rewards

Build segments in Zaptick at \`/contact-groups\`.

## Send time optimization

Best send times for WhatsApp broadcasts (India market):
- **Weekdays**: 10 AM – 12 PM (highest open rates)
- **Evenings**: 6 PM – 8 PM (second peak)
- **Weekends**: 11 AM – 1 PM (Saturday performs better than Sunday)

:::tip
Zaptick shows you **per-campaign analytics** at \`/campaigns/[id]\`. After 3–4 broadcasts, you'll have enough data to identify YOUR audience's optimal send time. It varies by industry.
:::

## The perfect broadcast formula

Every broadcast should follow this structure:

1. **Hook** (first line) — Grab attention. Ask a question or make a bold claim
2. **Value** (body) — What's in it for them? Be specific
3. **CTA** (call to action) — One clear next step. Button or link
4. **Opt-out** (footer) — "Reply STOP to unsubscribe"

:::pro-tip
Add a **Quick Reply button** to your broadcasts with options like "Tell me more" and "Not interested". This gives you instant feedback and keeps engagement high — which improves your Meta quality rating.
:::

:::checklist
- Broadcast frequency plan defined (max 2-3/week for marketing)
- At least 3 contact segments created
- Send time testing plan ready
- Template follows the Hook → Value → CTA → Opt-out formula
- Quick Reply buttons added for engagement tracking
:::`,
  },
  {
    weekSlug: "wk3-campaigns",
    lessonSlug: "build-broadcast-segment",
    title: "Build a broadcast segment",
    summary: "Use contact properties + behavior to ship a high-intent list.",
    content: `# Build a Broadcast Segment

Sending the right message to the **right people** is the entire game. In this lesson, you'll build a high-intent segment using Zaptick's segment builder.

## What is a segment?

A segment is a dynamic list of contacts that share specific attributes or behaviors. Unlike static lists, segments **update automatically** — new contacts who match the criteria are added, and those who no longer match are removed.

## Building segments in Zaptick

Navigate to \`/contact-groups\` and click "Create Segment":

:::steps
- **Name your segment** — Be descriptive: "High-intent leads – last 30 days"
- **Add filter rules** — Combine conditions with AND/OR logic
- **Preview the count** — See how many contacts match before saving
- **Save and use** — Your segment is now available in the campaign builder
:::

## Segment recipes

### Recipe 1: High-intent leads
Contacts who are warm and ready to buy:
- Tag contains "lead"
- Last message within 7 days
- Has replied to at least 1 template

### Recipe 2: At-risk customers
Customers who haven't engaged recently:
- Tag contains "customer"
- Last message more than 30 days ago
- No purchase in the last 60 days

### Recipe 3: VIP buyers
Your top spenders who deserve special treatment:
- Tag contains "customer"
- Total purchases > ₹10,000
- Has replied to campaigns (engaged)

### Recipe 4: New subscribers
Fresh contacts who need nurturing:
- Created within last 14 days
- No tag "customer"
- Has not received a campaign yet

:::tip
Start with **3–5 core segments** that cover your main audience buckets. You can always create more specific ones later as your contact base grows.
:::

## Using segments in campaigns

When creating a campaign at \`/campaigns/create\`:
1. Select your approved template
2. Choose your segment as the audience
3. Fill in template variables (use contact fields for personalization)
4. Schedule or send immediately

:::pro-tip
Always send a **test broadcast** to your "Test Numbers" group before sending to a full segment. One typo in a variable can make you look unprofessional to hundreds of contacts.
:::

:::checklist
- Created at least 3 segments using filter rules
- Previewed contact counts for each segment
- Built a campaign targeting your highest-intent segment
- Sent a test broadcast before going live
:::`,
  },
  {
    weekSlug: "wk3-campaigns",
    lessonSlug: "landing-pages-that-convert",
    title: "Landing pages that convert (CTWA)",
    summary: "Click-to-WhatsApp ads + pages that turn ad clicks into conversations.",
    content: `# Landing Pages That Convert (CTWA)

**Click-to-WhatsApp (CTWA)** ads are the most cost-effective way to generate leads on WhatsApp. Instead of sending traffic to a website, you send them directly into a WhatsApp conversation. This guide shows you how.

## Why CTWA ads work

:::highlight
CTWA ads have a **3–5x lower cost per lead** compared to traditional landing page funnels. Why? Zero friction. One tap → instant conversation. No forms, no email verification, no waiting.
:::

## The CTWA funnel

:::steps
- **Meta Ad** — A Facebook/Instagram ad with a "Send WhatsApp Message" button
- **Auto-welcome** — When the user clicks, Zaptick sends an instant automated welcome message
- **Qualification** — Your workflow asks 2–3 qualifying questions
- **Handoff** — Qualified leads are routed to a sales agent; others get nurture content
:::

## Setting up CTWA in Zaptick

Navigate to \`/ctwa\`:

1. **Connect your Meta Ads account** — Go to \`/ctwa/settings\` and link your Facebook Page
2. **Create a campaign** — Click "New Campaign" at \`/ctwa/campaigns/new\`
3. **Design your ad** — Image/video, headline, body text, CTA button
4. **Set your audience** — Use Meta's targeting (location, interests, demographics)
5. **Configure the welcome flow** — What happens when someone clicks? Set up an auto-reply + workflow
6. **Launch** — Set budget and schedule, then go live

## The perfect CTWA ad formula

**Image/Video**: Show your product or result (before/after works great)
**Headline**: Lead with the benefit, not the feature
**Body**: 2–3 lines max. Problem → Solution → CTA
**CTA**: "Send Message" or "Chat with us"

:::tip
**Video ads outperform image ads by 2x** on CTWA campaigns. A 15-second video showing your product in action is the sweet spot.
:::

## The welcome workflow

When someone clicks your CTWA ad, trigger this workflow:

1. **Instant reply** (within 1 second): "Hey! 👋 Thanks for your interest in [product]. I'm here to help!"
2. **Qualify** (2 seconds later): "Quick question — are you looking for [Option A] or [Option B]?"
3. **Based on reply**: Route to the right information or agent

:::warning
**Speed matters enormously with CTWA.** If your first reply takes more than 5 seconds, you lose up to 40% of potential leads. Use Zaptick's automation to ensure instant responses.
:::

:::pro-tip
Track your CTWA performance at \`/ctwa/campaigns/[id]\`. The key metrics are: Cost per conversation started, Qualification rate, and Cost per qualified lead. Aim for a cost per qualified lead under ₹50 for most Indian markets.
:::`,
  },
  {
    weekSlug: "wk3-campaigns",
    lessonSlug: "webinar-funnel",
    title: "The webinar funnel",
    summary: "Pre-show, show, replay — the 3 windows that drive 70% of conversions.",
    content: `# The Webinar Funnel

Webinars are the **highest-converting sales mechanism** in digital marketing. Combining them with WhatsApp makes them even more powerful. Here's the complete playbook.

## The 3 conversion windows

:::highlight
70% of webinar conversions happen in just **3 windows**: the 24 hours before, the live session itself, and the 48 hours after. Nail these three, and you've nailed the webinar.
:::

### Window 1: Pre-show (24 hours before)
- Send a WhatsApp reminder with the join link
- Share a "sneak peek" of what they'll learn
- Create urgency: "Only 47 spots remaining"

### Window 2: The live show
- Deliver incredible value for 45 minutes
- Make your offer in the last 15 minutes
- Use a limited-time bonus to drive urgency

### Window 3: Post-show replay (48 hours after)
- Send the replay link to attendees and no-shows
- Share key takeaways as a summary
- Follow up with a "last chance" offer

## Building a webinar in Zaptick

Navigate to \`/webinars\`:

:::steps
- **Create a new webinar** — Title, date, time, description
- **Build a landing page** — Use Zaptick's webinar landing page builder to create a registration page
- **Set up registration flow** — When someone registers via WhatsApp, auto-confirm and add to a segment
- **Configure reminders** — Automated WhatsApp messages: 24h before, 1h before, and "We're live!" at start time
- **Connect Zoom** — If using Zoom, connect via \`/integrations/zoom\` for auto-join links
- **Post-webinar follow-up** — Set up a workflow to send the replay + offer to all registrants
:::

## WhatsApp reminders that boost attendance

**24 hours before:**
> Hey {{name}}! 🎯 Tomorrow's the big day. "[Webinar Title]" starts at {{time}}. Here's what we'll cover: [1-2 bullet points]. See you there!

**1 hour before:**
> We go live in 60 minutes! Get your questions ready. Join link: {{link}} 🚀

**At start time:**
> We're LIVE! 🔴 Jump in now → {{link}}. First 5 minutes = the most valuable insight of the session.

**No-shows (30 min after start):**
> Missed the start? No worries — join now and catch the replay: {{link}}

:::tip
WhatsApp reminders achieve **85% attendance rates** vs. 30–40% for email-only reminders. That's the power of the platform.
:::

:::pro-tip
After the webinar, ask attendees: "On a scale of 1-5, how useful was this session?" via a Quick Reply template. The data helps you improve, and responses count as engagement for your Meta quality rating.
:::`,
  },
  {
    weekSlug: "wk3-campaigns",
    lessonSlug: "report-on-campaigns",
    title: "Report on campaigns like a CMO",
    summary: "What to share with stakeholders. The 3 numbers that matter.",
    content: `# Report on Campaigns Like a CMO

Running campaigns is half the job. The other half? Proving they worked. This guide teaches you how to report on WhatsApp marketing like a seasoned CMO.

## The 3 numbers that matter

:::highlight
Strip away the vanity metrics. Stakeholders care about three things: **Revenue generated**, **Cost per acquisition**, and **ROI percentage**. Everything else is supporting evidence.
:::

### 1. Revenue Generated
**How to calculate**: Track conversions from WhatsApp campaigns to purchases. Use UTM parameters, coupon codes, or Zaptick's attribution tracking.

### 2. Cost Per Acquisition (CPA)
**Formula**: Total spend (templates + CTWA ads + team time) ÷ Number of new customers acquired

### 3. ROI Percentage
**Formula**: ((Revenue generated - Total cost) ÷ Total cost) × 100

## Building your reporting dashboard

Zaptick's analytics at \`/analytics\` gives you:
- **Message delivery rates** — What % of messages were delivered, read, and replied to?
- **Campaign performance** — Per-campaign metrics: sends, deliveries, reads, clicks, replies
- **Conversation analytics** — Volume trends, response times, resolution rates
- **Template analytics** — Which templates perform best?

## The monthly report template

Share this with stakeholders every month:

### Executive Summary
- Total WhatsApp conversations: X
- Revenue attributed to WhatsApp: ₹X
- Monthly ROI: X%

### Campaign Performance
- Broadcasts sent: X
- Average delivery rate: X%
- Average read rate: X%
- Average reply rate: X%

### Top Performing Campaigns
1. [Campaign Name] — ₹X revenue, X% conversion
2. [Campaign Name] — ₹X revenue, X% conversion

### AI Agent Performance
- Conversations handled: X
- Deflection rate: X%
- Estimated cost savings: ₹X

### Recommendations for next month
- [Specific, data-backed recommendations]

:::tip
Always compare **month-over-month**. Stakeholders want to see trends, not just snapshots. "Reply rates improved from 23% to 31% — a 35% increase" is much more compelling than "Reply rate: 31%".
:::

:::pro-tip
Create a **live dashboard** using Zaptick's analytics export + Google Sheets. Share the link with stakeholders so they can check performance anytime without waiting for your monthly report.
:::`,
  },

  // ═══════════════════════════════════════════
  // Remaining weeks — condensed but still rich
  // ═══════════════════════════════════════════
  {
    weekSlug: "wk4-demo-day",
    lessonSlug: "pitch-deck-the-zaptick-way",
    title: "Pitch deck the Zaptick way",
    summary: "11 slides, 7 minutes, 1 ask. The exact template winners use.",
    content: `# Pitch Deck the Zaptick Way

The Demo Day pitch is your moment to shine. **11 slides. 7 minutes. 1 clear ask.** Here's the exact structure that Showdown winners use.

## The 11-slide framework

:::steps
- **Slide 1: Title** — Your agency name, tagline, and your name. Clean, bold, memorable
- **Slide 2: The Problem** — What pain does your target market feel? Use a real quote from a prospect
- **Slide 3: The Solution** — How WhatsApp marketing (via Zaptick) solves this problem. Keep it to 3 bullet points
- **Slide 4: Demo** — A 90-second live demo of your best workflow or campaign in Zaptick. Show, don't tell
- **Slide 5: Results** — Real numbers. Even if it's from a pilot or your own business. Revenue, engagement rates, cost savings
- **Slide 6: Market Size** — How big is the opportunity? How many businesses need this?
- **Slide 7: Your ICP** — Who exactly are you selling to? (Reference your ICP Canvas from Week 0)
- **Slide 8: Pricing** — Your tiered offer structure (from Week 5). Starter / Growth / Premium
- **Slide 9: Traction** — Clients signed, pipeline built, partnerships formed. Any proof of momentum
- **Slide 10: Team** — Who are you? What makes you the right person to build this?
- **Slide 11: The Ask** — What do you want from the judges? Co-marketing support? Introductions? The prize?
:::

:::highlight
The best pitches spend 60% of the time on slides 4-5 (demo + results). Judges want to see it work, not hear about theory.
:::

:::tip
Practice your pitch **10 times** before Demo Day. Record yourself. Time it. The 7-minute limit is strict — going over signals poor preparation.
:::

:::pro-tip
End with a memorable one-liner. The pitch that sticks is the pitch that wins. Something like: "Every business talks to their customers. We make those conversations profitable."
:::`,
  },
  {
    weekSlug: "wk4-demo-day",
    lessonSlug: "record-your-pitch",
    title: "Record your 5-min pitch",
    summary: "Submission spec, scoring rubric, what reviewers look for.",
    content: `# Record Your 5-Minute Pitch

Time to ship it. Record your pitch and submit it for review. Here's everything you need to know about the submission process.

## Submission specifications

- **Length**: 5 minutes maximum (hard cutoff at 5:30)
- **Format**: MP4, MOV, or direct YouTube/Loom link
- **Resolution**: 1080p minimum
- **Audio**: Clear audio is critical — use a mic if possible
- **Screen share**: Include a live Zaptick demo (at least 90 seconds)

## The scoring rubric

Judges evaluate on 5 criteria (20 points each, 100 total):

1. **Clarity** (20 pts) — Is the problem and solution clearly articulated?
2. **Demo quality** (20 pts) — Does the Zaptick demo showcase real mastery?
3. **Results** (20 pts) — Are there real numbers, even if small?
4. **Market understanding** (20 pts) — Do they know their ICP and market size?
5. **Presentation** (20 pts) — Confidence, energy, and polish

:::tip
Judges see dozens of pitches. **Start with your most impressive number** to immediately stand out. "In 2 weeks, I recovered ₹4.2L in abandoned carts using a single Zaptick workflow" is a much stronger opener than "Hi, my name is..."
:::

:::checklist
- Pitch deck finalized (11 slides)
- Script rehearsed 10+ times
- Recording setup tested (camera, mic, screen share)
- Demo workflow running and ready to show
- Video recorded and uploaded
- Submission form completed
:::`,
  },
  {
    weekSlug: "wk4-demo-day",
    lessonSlug: "demo-day-live",
    title: "Demo Day — live stage",
    summary: "How the live judging works, who's on the panel, what to bring.",
    content: `# Demo Day — Live Stage

The Top 10 pitches go live. Here's how the live judging works and how to prepare.

## The live format

- **Duration**: 2 hours total
- **Per presenter**: 7 minutes pitch + 3 minutes Q&A
- **Panel**: Zaptick founders + industry experts + guest judges
- **Audience**: The entire cohort watches live

## What to bring

:::checklist
- Your pitch deck (uploaded beforehand, but have a backup)
- Zaptick dashboard open and logged in (for live demo)
- Stable internet connection (wired preferred)
- Good lighting and clean background
- Water nearby (you'll need it!)
- Confidence and energy
:::

## Handling Q&A like a pro

:::tip
The Q&A is where winners separate from the pack. Judges ask tough questions not to trip you up, but to see how you think on your feet. If you don't know the answer, say "Great question — I don't have that data yet, but here's how I'd find out." Honesty > bluffing.
:::

## Win or learn

:::highlight
Whether you win the Showdown or not, Demo Day is the beginning, not the end. Every Top 10 finalist in previous cohorts went on to sign clients within 30 days. The exposure alone is worth it.
:::`,
  },
  {
    weekSlug: "wk4-demo-day",
    lessonSlug: "after-demo-day",
    title: "After Demo Day — winners & non-winners",
    summary: "Whether you place or not — the playbook to capitalize on the moment.",
    content: `# After Demo Day — The Playbook

Demo Day is over. Whether you placed in the Top 10 or not, here's how to capitalize on the momentum.

## If you won

:::steps
- **Celebrate** — You earned it. Share it on social media, your WhatsApp status, everywhere
- **Co-marketing launch** — Work with the Zaptick team on a co-branded case study
- **Leverage the credential** — "Zaptick Showdown Winner" goes on your pitch deck, LinkedIn, and proposals
- **Sign clients fast** — The credibility boost has a half-life. Use it within 30 days
:::

## If you didn't place

:::steps
- **Get feedback** — Ask judges for specific feedback on your pitch. This is gold
- **Improve and re-pitch** — Apply the feedback, and pitch to real prospects this week
- **Network** — Connect with winners and other cohort members. Partnerships often form here
- **Remember the real prize** — The skills you built in 8 weeks are worth far more than the cash prize
:::

:::highlight
The Showdown is a milestone, not a finish line. The real game starts now — signing clients and building your agency.
:::

:::pro-tip
Post a "Demo Day reflection" in the ZapAcademy community within 48 hours. Share what you learned, what you'd do differently, and your goals for the next 90 days. This post often gets more engagement than any other in the cohort — and it keeps you accountable.
:::`,
  },

  // Week 5–7 lessons (condensed)
  ...generateWeek5to7Guides(),
];

function generateWeek5to7Guides(): GuideEntry[] {
  return [
    {
      weekSlug: "wk5-pricing",
      lessonSlug: "pricing-fundamentals",
      title: "Pricing fundamentals",
      summary: "Cost-plus, value-based, retainer. When to use which.",
      content: `# Pricing Fundamentals

Pricing is where most new agencies stumble. Charge too little and you burn out. Charge too much without proving value and you lose deals. This guide gives you the frameworks.

## Three pricing models

### 1. Cost-plus pricing
**Formula**: Your costs + desired margin
**Best for**: Project-based work, one-time setups
**Example**: Setting up Zaptick + 5 workflows = ₹15,000 cost (your time) + 50% margin = ₹22,500

### 2. Value-based pricing
**Formula**: % of value you create for the client
**Best for**: Revenue-driving work (campaigns, lead gen)
**Example**: Your campaigns generate ₹5L/month in additional revenue → charge ₹50,000/month (10%)

### 3. Retainer pricing
**Formula**: Monthly fee for ongoing services
**Best for**: Long-term client relationships
**Example**: ₹25,000–₹75,000/month for ongoing WhatsApp marketing management

:::highlight
The most successful Zaptick agencies use **value-based pricing for initial projects** and transition to **retainers** for ongoing work. This maximizes both revenue and client lifetime value.
:::

:::tip
Never price by the hour. Your speed is a feature, not a discount. If you can build a workflow in 30 minutes that saves a client 40 hours/month, your value isn't "30 minutes of work."
:::

:::pro-tip
Always present **three options** (Good / Better / Best). 60% of clients pick the middle option. Price it where you want them.
:::`,
    },
    {
      weekSlug: "wk5-pricing",
      lessonSlug: "build-your-tiered-offer",
      title: "Build your tiered offer",
      summary: "Starter / Growth / Premium retainer — interactive simulator.",
      content: `# Build Your Tiered Offer

The three-tier pricing model is the gold standard for service businesses. Here's how to build yours.

## The three tiers

### Starter (₹15,000–25,000/month)
- Zaptick setup and configuration
- 5 template messages created and approved
- 2 basic workflows (welcome + FAQ bot)
- Monthly performance report
- Email support

### Growth (₹35,000–50,000/month)
*Everything in Starter, plus:*
- 10 template messages
- 5 advanced workflows (cart recovery, lead nurture, etc.)
- AI agent setup and training
- Weekly performance reports
- CTWA ad management
- Priority WhatsApp support

### Premium (₹75,000–1,00,000/month)
*Everything in Growth, plus:*
- Unlimited templates and workflows
- Full omnichannel setup (WhatsApp + RCS + SMS + Email)
- Custom integrations (Shopify, CRM, etc.)
- Dedicated account manager (you or a team member)
- Daily monitoring and optimization
- Quarterly business reviews

:::tip
The Starter tier is your **foot in the door**. Price it accessibly. Once you prove value, upgrading to Growth or Premium is an easy conversation.
:::

:::checklist
- Three tiers defined with clear scope
- Pricing set for each tier
- Proposal template created
- Ready to present to prospects
:::`,
    },
    {
      weekSlug: "wk5-pricing",
      lessonSlug: "msa-template",
      title: "MSA / SOW template (lawyer-reviewed)",
      summary: "Plug-and-play contracts that protect both sides.",
      content: `# MSA / SOW Template

A professional contract protects both you and your client. Here's a plug-and-play template you can customize.

## Key sections every contract needs

:::steps
- **Scope of Work** — Exactly what you'll deliver. Be specific. Vague scope = scope creep
- **Timeline** — Start date, milestones, deliverable dates
- **Pricing & Payment** — Amount, payment schedule, late payment terms
- **Term & Termination** — Contract duration, notice period for cancellation (30 days minimum)
- **Confidentiality** — Both parties keep business information private
- **Liability** — Limit your liability to the total contract value
- **IP Ownership** — Client owns the campaigns/workflows you build for them
:::

:::warning
**Never start work without a signed contract.** Even for friends. Even for small projects. Especially for small projects — those are the ones most likely to have misunderstandings.
:::

:::tip
Use a tool like **Zoho Sign** or **DocuSign** for digital signatures. It's professional and creates a clear paper trail.
:::

:::pro-tip
Include a **"Change Request" clause**: Any work outside the original scope requires a written change request and may incur additional fees. This single clause prevents 90% of scope creep.
:::`,
    },
    {
      weekSlug: "wk5-pricing",
      lessonSlug: "payment-links",
      title: "Payment links + invoicing",
      summary: "Razorpay / Stripe setup, recurring billing, churn protection.",
      content: `# Payment Links + Invoicing

Getting paid should be frictionless. Here's how to set up professional payment collection using Zaptick's integrations.

## Payment gateway setup

Zaptick integrates with:
- **Razorpay** — Best for Indian businesses (\`/integrations/razorpay\`)
- **Stripe** — Best for international clients (\`/integrations/stripe\`)
- **Cashfree** — Alternative for Indian payments (\`/integrations/cashfree\`)

:::steps
- **Connect your gateway** — Go to the integration page and follow the OAuth flow
- **Create a payment link** — Generate links for one-time or recurring payments
- **Send via WhatsApp** — Share payment links directly in conversations
- **Track status** — See payment status in real-time from Zaptick's dashboard
:::

## Recurring billing for retainers

For monthly retainers, set up **recurring payment links**:
- Auto-charges the client every month
- Sends a WhatsApp reminder before charging
- Auto-generates and sends invoices

:::tip
Offer a **5% discount for quarterly prepayment** and **10% for annual prepayment**. This improves your cash flow and reduces churn.
:::

:::pro-tip
Set up a **workflow** that triggers when a payment fails: send a friendly WhatsApp reminder, wait 3 days, escalate to a call. Automate the awkward "your payment failed" conversation.
:::`,
    },
    {
      weekSlug: "wk5-pricing",
      lessonSlug: "negotiation-101",
      title: "Negotiation 101 for new agencies",
      summary: "How to defend your rates. Proven scripts.",
      content: `# Negotiation 101 for New Agencies

Every prospect will try to negotiate. Here's how to defend your rates with confidence.

## The golden rule

:::highlight
Never negotiate on price. Negotiate on **scope**. If a client wants to pay less, give them less. Never do the same work for lower pay.
:::

## Common objections and responses

**"That's too expensive."**
> "I understand. Let me show you the ROI. Based on our pilot, this investment generates ₹X in additional revenue. That's a Y% return. Would you like to see the numbers?"

**"Can you do it for half?"**
> "I can absolutely create a package at that price point. Here's what it would include: [reduced scope]. If you'd like the full package, the investment is [original price]."

**"We have a tight budget."**
> "I respect that. Many of our best clients started with our Starter package at ₹[lower tier]. Once you see the results, upgrading is an easy decision."

**"Our current agency charges less."**
> "That's worth exploring — what results are they delivering? If you're happy with them, that's great. If not, perhaps the lower price is costing you more in missed opportunities."

:::tip
**Silence is your friend.** After stating your price, stop talking. The first person to speak after a price is stated loses. Let them process.
:::

:::pro-tip
Always have a **walk-away number** — the minimum you'll accept. Below that, politely decline. Undercharging leads to resentment, poor work, and burnout. It's better to say no and find a client who values your work.
:::`,
    },
    // Week 6
    {
      weekSlug: "wk6-clients",
      lessonSlug: "lead-machine",
      title: "The lead machine — outbound + inbound",
      summary: "How to fill your pipeline with 100 qualified prospects in 30 days.",
      content: `# The Lead Machine — Outbound + Inbound

You have the skills. You have the pricing. Now you need **clients**. Here's how to build a lead machine that fills your pipeline.

## The 100-in-30 challenge

:::highlight
Your goal this week: **100 qualified prospects** in your pipeline within 30 days. Not 100 random contacts — 100 businesses that match your ICP and could realistically become clients.
:::

## Outbound strategies (50 leads)

### 1. LinkedIn prospecting
- Optimize your LinkedIn profile to scream "WhatsApp marketing expert"
- Search for your ICP (e.g., "D2C founder India" or "Ecommerce marketing manager")
- Send personalized connection requests (not pitches!)
- After connecting, share valuable content for 1 week, then start a conversation

### 2. Cold WhatsApp outreach
- Use Zaptick to send personalized template messages
- Lead with value: "I noticed [specific observation about their business]. Here's one thing that could improve your WhatsApp response rates by 3x..."
- Never pitch in the first message

### 3. Referral requests
- Ask your network: "Do you know any business owner struggling with customer communication?"
- Offer a referral bonus (₹5,000 per signed client)

## Inbound strategies (50 leads)

### 1. Content marketing
- Post daily on LinkedIn about WhatsApp marketing tips
- Share case studies and results
- Create short-form video content

### 2. Community presence
- Join WhatsApp/Telegram groups in your target industry
- Provide genuine help and advice
- Become the "go-to WhatsApp person" in those communities

### 3. Webinars
- Host a free monthly webinar: "How [Industry] businesses are using WhatsApp to grow revenue"
- Use Zaptick's webinar funnel (from Week 3!)

:::tip
Track every prospect in a simple spreadsheet or CRM. For each one, note: Name, Company, How you found them, Last interaction, Next step, Status (cold/warm/hot).
:::

:::pro-tip
The **best leads come from showcasing results**. Every time you achieve something notable for a client (or yourself), post about it publicly. Results attract clients like magnets.
:::`,
    },
    {
      weekSlug: "wk6-clients",
      lessonSlug: "discovery-call-script",
      title: "Discovery call script (line-by-line)",
      summary: "Open, qualify, diagnose, present, close — a script that converts.",
      content: `# Discovery Call Script

The discovery call is where deals are won or lost. Here's a line-by-line script that converts.

## The 5-phase framework

### Phase 1: Open (2 minutes)
> "Thanks for taking the time, [Name]. Before we dive in, I'd love to understand your business a bit better. Can you tell me about what [Company] does and who your typical customer is?"

### Phase 2: Qualify (3 minutes)
> "How are you currently communicating with your customers?"
> "What tools are you using for marketing and customer engagement?"
> "What's your biggest challenge with customer communication right now?"

### Phase 3: Diagnose (5 minutes)
> "Based on what you've shared, it sounds like [summarize their problem]. Is that accurate?"
> "What has that challenge cost you? In terms of lost sales, wasted time, or missed opportunities?"
> "If you could wave a magic wand and fix one thing about your customer communication, what would it be?"

### Phase 4: Present (5 minutes)
> "I think we can help. Let me show you what we've done for businesses like yours..."
> [Share 1-2 relevant case studies/results]
> "For [Company], I'd recommend our [Tier] package, which includes..."

### Phase 5: Close (5 minutes)
> "Does this feel like it could solve the challenge you described?"
> "What questions do you have?"
> "If we were to get started, when would be ideal timing for your team?"

:::tip
**Listen more than you talk.** The ideal ratio is 70% them, 30% you. The more they talk, the more you understand their needs, and the better your proposal will be.
:::

:::pro-tip
Record every discovery call (with permission). Review them weekly to improve. You'll be shocked at how much better you get after just 10 calls.
:::`,
    },
    {
      weekSlug: "wk6-clients",
      lessonSlug: "objection-handling",
      title: "Objection handling for new agencies",
      summary: "Top 12 objections + the exact response.",
      content: `# Objection Handling for New Agencies

Objections aren't rejections — they're requests for more information. Here are the top 12 and how to handle each one.

## The 12 most common objections

1. **"We're too small for WhatsApp marketing"** → "Actually, WhatsApp marketing works best for small businesses. Lower costs, direct communication, and personal touch are your advantages over big companies."

2. **"We already have an email marketing tool"** → "Great — email and WhatsApp complement each other perfectly. WhatsApp has 98% open rates vs. 20% for email. We'd add WhatsApp alongside your email, not replace it."

3. **"We don't have the budget right now"** → "I understand. What if we started with a pilot project at [lower tier price] to prove the ROI first?"

4. **"We tried WhatsApp marketing before and it didn't work"** → "I'd love to understand what you tried. Most businesses that struggle with WhatsApp are sending mass messages without segmentation or automation. Our approach is different."

5. **"Can we just do it ourselves?"** → "Absolutely! Zaptick is designed for self-service. But most businesses find that the time investment of learning the platform, building workflows, and managing campaigns costs more than hiring an expert."

6. **"We need to think about it"** → "Of course. What specific aspect would you like to think through? I'm happy to provide any additional information that would help your decision."

:::highlight
The best objection handler isn't the one with the cleverest responses — it's the one who asked enough questions during discovery that objections rarely come up in the first place.
:::

:::tip
After handling an objection, always ask: **"Does that address your concern?"** Don't assume it's resolved. Confirm before moving on.
:::`,
    },
    {
      weekSlug: "wk6-clients",
      lessonSlug: "client-onboarding",
      title: "Client onboarding — the first 30 days",
      summary: "How to set expectations and lock in the relationship.",
      content: `# Client Onboarding — The First 30 Days

The first 30 days determine whether a client stays for 3 months or 3 years. Here's the playbook.

## The 30-day onboarding timeline

:::steps
- **Day 1–3: Setup** — Connect their WABA, set up Zaptick, import contacts, configure inbox
- **Day 4–7: Foundation** — Create templates, set up basic workflows, configure routing rules
- **Day 8–14: Launch** — Send first campaign, deploy AI agent, activate automations
- **Day 15–21: Optimize** — Review analytics, adjust workflows, refine templates based on data
- **Day 22–30: Review** — Present results, align on next month's plan, upsell if appropriate
:::

## Setting expectations

In your kickoff meeting, cover:
- **What success looks like** — Define specific KPIs (response time, conversion rate, etc.)
- **Communication cadence** — Weekly updates? Bi-weekly calls?
- **Turnaround times** — How quickly will you respond to their requests?
- **What you need from them** — Access, content, approvals, etc.

:::tip
Send a **Welcome Kit** on Day 1: a beautiful PDF with everything they need to know — your contact info, the timeline, what to expect, and how to reach you. First impressions matter.
:::

:::pro-tip
Over-deliver in the first 30 days. Send the first report before they ask. Set up one extra workflow they didn't expect. The "wow" factor in the first month sets the tone for the entire relationship.
:::`,
    },
    {
      weekSlug: "wk6-clients",
      lessonSlug: "case-study-engine",
      title: "Build a case-study engine",
      summary: "Capture wins, package them, use them to land the next 3 clients.",
      content: `# Build a Case-Study Engine

Case studies are the most powerful sales tool an agency can have. Here's how to systematically create them.

## The case study formula

Every case study follows this structure:

1. **The Client** — Who are they? Industry, size, challenge
2. **The Problem** — What were they struggling with? Use their words
3. **The Solution** — What did you build/implement with Zaptick?
4. **The Results** — Hard numbers. Revenue, cost savings, time saved
5. **The Quote** — A testimonial from the client

:::tip
Ask for permission to create a case study **during onboarding**, not after. "We'd love to document our work together as a case study — it's great exposure for both of us." Most clients say yes when asked early.
:::

## Capturing wins systematically

:::steps
- **Screenshot everything** — Before/after analytics, workflow builds, campaign results
- **Log metrics weekly** — Track the numbers from Day 1 so you have a complete story
- **Record testimonials** — A 30-second video testimonial is worth more than a written one
- **Get specific quotes** — "Our response time went from 4 hours to 30 seconds" beats "They did a great job"
:::

:::highlight
Aim to publish **one case study per month**. After 6 months, you'll have enough social proof to close deals on reputation alone.
:::

:::pro-tip
Share your case studies as **LinkedIn posts**, not just PDFs. A well-structured LinkedIn post with real numbers gets 10x more reach than a PDF link.
:::`,
    },
    // Week 7
    {
      weekSlug: "wk7-scale",
      lessonSlug: "reporting-dashboard",
      title: "Build your reporting dashboard",
      summary: "The 6 KPIs every WhatsApp agency must report monthly.",
      content: `# Build Your Reporting Dashboard

Professional reporting is what separates a freelancer from an agency. Here are the 6 KPIs every client expects to see.

## The 6 essential KPIs

1. **Message delivery rate** — % of messages successfully delivered (target: 95%+)
2. **Read rate** — % of delivered messages that were read (target: 80%+)
3. **Reply rate** — % of read messages that got a response (target: 15%+)
4. **Conversation resolution time** — Average time to resolve a query (target: under 10 minutes)
5. **AI deflection rate** — % handled by AI without human intervention (target: 60%+)
6. **Revenue attributed** — ₹ directly traceable to WhatsApp campaigns

## Building the dashboard

Use Zaptick's \`/analytics\` as your data source:

:::steps
- **Export weekly data** — Download CSV from Zaptick analytics
- **Create a Google Sheet template** — Set up charts for each KPI
- **Add month-over-month comparison** — Show trends, not just snapshots
- **Include commentary** — What worked, what didn't, what you're changing
- **Share automatically** — Use Google Sheets sharing or schedule a monthly email
:::

:::tip
Include **one "hero metric"** at the top of every report — the single number that best represents the value you're creating. Make it impossible to miss.
:::

:::pro-tip
Offer clients a **live dashboard link** they can check anytime. It builds trust and reduces "how are things going?" messages.
:::`,
    },
    {
      weekSlug: "wk7-scale",
      lessonSlug: "qbr-cadence",
      title: "QBRs that retain clients for 24+ months",
      summary: "Structure, prep, what to surface — by quarter.",
      content: `# QBRs That Retain Clients for 24+ Months

Quarterly Business Reviews (QBRs) are the secret to long-term client retention. Done right, they make your agency indispensable.

## The QBR structure (60 minutes)

:::steps
- **Review (15 min)** — Recap last quarter's goals and results. Celebrate wins
- **Insights (15 min)** — Share trends, benchmarks, and competitive intelligence
- **Strategy (20 min)** — Propose next quarter's plan with specific initiatives
- **Alignment (10 min)** — Agree on goals, budgets, and priorities for next quarter
:::

## What to present each quarter

### Q1 — Foundation review
- Year-in-review of previous year
- Benchmark against industry averages
- Set annual targets

### Q2 — Growth acceleration
- Mid-year progress check
- Identify scaling opportunities
- Propose new channels (RCS, SMS, Email via Zaptick)

### Q3 — Optimization
- Deep dive into what's working and what's not
- A/B test results and learnings
- Budget reallocation recommendations

### Q4 — Planning
- Annual results summary
- Next year strategy proposal
- Contract renewal discussion

:::highlight
Clients who receive regular QBRs have a **retention rate of 92%** vs. 64% for those who don't. The QBR is your retention engine.
:::

:::pro-tip
Send a **QBR prep email** 1 week before the meeting asking the client for their top 3 priorities for next quarter. This makes the QBR collaborative, not presentational.
:::`,
    },
    {
      weekSlug: "wk7-scale",
      lessonSlug: "referral-loop",
      title: "Build a referral loop",
      summary: "How to get every client to send you 2 more.",
      content: `# Build a Referral Loop

The cheapest and highest-converting leads come from existing clients. Here's how to systematically generate referrals.

## The referral system

:::steps
- **Deliver exceptional results** — This is prerequisite #1. No results = no referrals
- **Ask at the right moment** — After a big win or positive feedback. "Glad you're happy! Do you know anyone else who could benefit from this?"
- **Make it easy** — Give them a templated message they can forward: "Hey [Name], I've been working with [Your Agency] on WhatsApp marketing and the results have been incredible. They helped us [specific result]. I thought of you because [reason]. Here's their link if you want to chat: [link]"
- **Reward referrals** — ₹5,000 credit or a free month for every referred client who signs
- **Follow up** — Thank the referrer regardless of whether the lead converts
:::

:::highlight
Agencies with a formal referral program grow **2.5x faster** than those without one. It's the highest-ROI marketing channel you'll ever have.
:::

:::tip
Set a **reminder** after every client's 90-day mark to ask for a referral. By that point, they've seen enough results to confidently recommend you.
:::`,
    },
    {
      weekSlug: "wk7-scale",
      lessonSlug: "hiring-your-first-ops",
      title: "Hiring your first ops person",
      summary: "JD, comp, where to find them, how to test in week 1.",
      content: `# Hiring Your First Ops Person

When you hit 3–5 clients, you need help. Here's how to hire your first team member.

## When to hire

You're ready when:
- You're spending more than 50% of your time on execution (not sales/strategy)
- Clients are waiting for responses
- You're turning down new business because of capacity

## The ideal first hire

**Role**: WhatsApp Marketing Operations Specialist
**Responsibilities**: Template creation, campaign execution, analytics reporting, basic workflow management
**Skills needed**: Attention to detail, basic marketing knowledge, tech-savvy, good communication

:::steps
- **Write a clear JD** — List specific tasks, not vague responsibilities
- **Post on the right platforms** — LinkedIn, AngelList, and WhatsApp marketing communities
- **Screen with a task** — Give candidates a practical test: "Set up this workflow in Zaptick" (use a trial account)
- **Start part-time** — 20 hours/week for the first month while you train them
- **Document everything** — Create SOPs for every task before they start
:::

## Compensation benchmarks (India)

- **Intern**: ₹10,000–15,000/month
- **Junior (0-1 year)**: ₹20,000–30,000/month
- **Mid-level (1-3 years)**: ₹35,000–50,000/month
- **Senior (3+ years)**: ₹50,000–75,000/month

:::tip
**Train them on Zaptick using ZapAcademy!** Give them access to the same curriculum you just completed. In 2 weeks, they'll be proficient enough to handle day-to-day operations.
:::

:::pro-tip
Hire for attitude, train for skill. Someone eager to learn with a great work ethic will outperform an experienced but unmotivated hire every time.
:::`,
    },
    {
      weekSlug: "wk7-scale",
      lessonSlug: "graduation-next-steps",
      title: "Graduation — your next 90 days",
      summary: "Cohort wraps. The roadmap from here to ₹1 Cr/year.",
      content: `# Graduation — Your Next 90 Days

Congratulations. You've completed ZapAcademy. But this isn't the end — it's the beginning. Here's your roadmap for the next 90 days.

## The ₹1 Cr/year roadmap

:::highlight
₹1 Cr/year = ₹8.3L/month = ~12 clients at ₹70,000/month average retainer. That's the math. Now let's build the plan.
:::

## 90-day action plan

### Days 1–30: Foundation
:::checklist
- Sign 2 more clients (total: 5)
- Hire your first ops person
- Create 3 case studies from existing clients
- Post daily on LinkedIn about WhatsApp marketing
- Set up a referral program
:::

### Days 31–60: Growth
:::checklist
- Sign 3 more clients (total: 8)
- Launch a monthly webinar for lead generation
- Build partnerships with complementary agencies
- Explore adding RCS/SMS/Email as upsells (all available in Zaptick!)
- Start documenting your processes as SOPs
:::

### Days 61–90: Scale
:::checklist
- Sign 4 more clients (total: 12)
- Hire a second team member
- Raise prices for new clients by 20%
- Launch a client newsletter
- Apply for Zaptick's partner program for co-marketing
:::

## Beyond 90 days

- **Month 4–6**: Systematize everything. You should be spending 80% of your time on sales and strategy, 20% on execution
- **Month 7–9**: Launch a productized service (fixed scope, fixed price, scalable delivery)
- **Month 10–12**: Hit ₹8.3L/month. Celebrate. Then set the next target: ₹2 Cr/year

:::highlight
You now have every skill, every template, every workflow, and every script you need. The only thing between you and ₹1 Cr/year is execution. Go build something extraordinary.
:::

:::cta /community Share your graduation post →
:::`,
    },
  ];
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected.");

  let updated = 0;
  let created = 0;

  for (const guide of GUIDES) {
    const readingTime = Math.ceil(guide.content.length / 1200);
    const result = await Lesson.findOneAndUpdate(
      { weekSlug: guide.weekSlug, lessonSlug: guide.lessonSlug },
      {
        $set: {
          title: guide.title,
          summary: guide.summary,
          content: guide.content,
          readingTimeMinutes: readingTime,
        },
        $setOnInsert: {
          weekSlug: guide.weekSlug,
          lessonSlug: guide.lessonSlug,
          isPublished: true,
          xpVideoComplete: 50,
        },
      },
      { upsert: true, new: true }
    );

    if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
      created++;
    } else {
      updated++;
    }
    console.log(`  ✅ ${guide.weekSlug}/${guide.lessonSlug} (${readingTime} min read)`);
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}, Total: ${GUIDES.length}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
