# Test Messages for Mindful Assistant

Use these sample messages to test the AI analysis capabilities of the Mindful Messaging Assistant.

## 📋 Task Detection

### Basic Tasks
```
I need to finish the quarterly report by Friday.
```

```
Can you please review the proposal and send feedback by tomorrow?
```

```
We should schedule a meeting to discuss the project timeline.
```

### Complex Tasks
```
I need to finish the project documentation, send it to John Smith for review, and then present it to the team by next Tuesday at 3pm.
```

## 📅 Date Extraction

### Specific Dates
```
Let's meet on March 15th at 2:30pm for the budget discussion.
```

```
The deadline for the proposal is 12/31/2024.
```

### Relative Dates
```
Can we reschedule for tomorrow morning?
```

```
I'll get back to you next week with the details.
```

## 👥 People Detection

### Names in Context
```
John Smith mentioned that Sarah Johnson will be joining the meeting.
```

```
Please forward this to Mike and Lisa for their input.
```

## ⚠️ Risk Assessment

### Urgent Situations
```
This is urgent - we have a critical issue with the production system.
```

```
We're facing a major problem with the deadline.
```

### Conflicts
```
There's a conflict between the marketing and development teams.
```

## ❓ Questions

### Direct Questions
```
Can you help me understand the new requirements?
```

```
What's the status of the project?
```

### Indirect Questions
```
I'm wondering if we should reconsider the approach.
```

## 😊 Positive Sentiment

### Appreciation
```
Thank you so much for your help with this project!
```

```
Great work on the presentation yesterday.
```

## 😔 Negative Sentiment

### Concerns
```
I'm really worried about the timeline for this project.
```

```
This situation is quite frustrating for everyone involved.
```

## 🔄 Mixed Context

### Complex Messages
```
Hi team, I need to finish the quarterly report by Friday and send it to John Smith. The meeting is scheduled for next Tuesday at 3pm, but I'm concerned about the timeline. Can you help me understand the new requirements? This is quite urgent.
```

### Meeting Requests
```
Let's schedule a meeting tomorrow at 2pm to discuss the project issues. I need to get input from Sarah and Mike before the deadline on Friday.
```

## 📧 Email Context

### Professional Emails
```
Subject: Project Update Required

Hi Sarah,

I hope this email finds you well. I need to discuss the Q4 project timeline with you and Mike. We have a deadline approaching on December 15th, and I'm concerned about meeting our targets.

Could we schedule a meeting for tomorrow afternoon? I'd like to review the current status and address any potential issues.

Best regards,
John
```

## 💬 Chat Messages

### WhatsApp/Messenger Style
```
Hey! Can you help me with the presentation? I need to finish it by tomorrow and I'm stuck on the budget section. Also, do you know if Sarah is available for a quick call today?
```

### Slack Style
```
@channel Quick update: The project deadline has been moved to Friday. @john @sarah please review the latest changes and let me know if you see any issues. This is pretty urgent!
```

## 🎯 Testing Scenarios

### Scenario 1: Task Management
**Input:** "I need to finish the project by Friday and send it to John Smith"
**Expected Output:**
- Tasks: "finish the project by Friday", "send it to John Smith"
- Dates: "Friday"
- People: "John Smith"
- Tone: Professional/Request

### Scenario 2: Meeting Coordination
**Input:** "Let's meet tomorrow at 3pm for the team discussion"
**Expected Output:**
- Tasks: "meet for team discussion"
- Dates: "tomorrow", "3pm"
- Tone: Friendly/Request

### Scenario 3: Urgent Issue
**Input:** "This is urgent - we have a problem with the deadline"
**Expected Output:**
- Risks: "Contains 'urgent' - may need attention", "Contains 'problem' - may need attention"
- Tasks: "address deadline issue"
- Tone: Concerned/Urgent

### Scenario 4: Question
**Input:** "Can you help me understand the new requirements?"
**Expected Output:**
- Tasks: "understand new requirements"
- Tone: Question/Request
- Suggested replies should be helpful and responsive

## 🔧 Testing Instructions

1. **Desktop App:**
   - Press `Cmd/Ctrl+Shift+M`
   - Paste any test message
   - Check insights and suggested replies

2. **Browser Extension:**
   - Select text on any messaging platform
   - Right-click and choose "Analyze with Mindful"
   - Check the popup for results

3. **Manual Testing:**
   - Copy test messages to clipboard
   - Use the extension or desktop app
   - Verify AI analysis accuracy

## 📊 Expected Results

The AI should correctly identify:
- ✅ Action items and tasks
- ✅ Dates and times
- ✅ People names
- ✅ Urgent/risky content
- ✅ Questions and requests
- ✅ Sentiment (positive/negative/neutral)
- ✅ Appropriate reply suggestions

## 🚀 Performance Notes

- **Desktop App:** Should process instantly (local AI)
- **Browser Extension:** May take 1-3 seconds (cloud API)
- **Fallback Mode:** Works without API key (basic analysis)
- **Error Handling:** Graceful degradation if AI fails
