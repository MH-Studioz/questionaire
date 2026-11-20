/* ============================================================================
   QUESTIONAIRE — questions/academic-skills/study-skills.js
   Study skills for the Universal Study Vault: exam hacks, memory tricks and
   planning. These are the evidence-based techniques, not generic trivia.
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "study-skills",
    area: "academic-skills",
    title: "Study skills",
    subjects: ["exam-hacks", "memory-tricks", "study-planning"],
    facts: [
      ["What is retrieval practice?", "Recalling information from memory instead of rereading it", ["Highlighting a textbook", "Copying notes neatly", "Listening to a lecture again"], "Pulling information out strengthens memory more than putting it in."],
      ["What is spaced repetition?", "Reviewing material at increasing intervals", ["Cramming everything the night before", "Studying one topic for hours", "Reading notes once"], "Spacing reviews fights forgetting."],
      ["What is interleaving?", "Mixing different problem types in one study session", ["Doing one topic to exhaustion", "Studying only easy questions", "Splitting study by subject for a week"], "Mixing forces you to choose the right method."],
      ["What is the testing effect?", "Quizzing yourself improves later recall", ["Tests only measure learning", "Tests should be avoided while learning", "Rereading is as effective"], "Testing is a learning tool, not just assessment."],
      ["What is elaborative interrogation?", "Asking why a fact is true and connecting it to what you know", ["Memorising lists verbatim", "Repeating a fact aloud", "Summarising a chapter"], "Explaining the reason deepens encoding."],
      ["What is dual coding?", "Combining words with diagrams or visuals", ["Studying two subjects at once", "Using two textbooks", "Reading aloud and silently"], "Verbal and visual channels reinforce each other."],
      ["What is chunking?", "Grouping information into meaningful units", ["Dividing study time into short blocks", "Memorising every item separately", "Writing notes in short sentences"], "Chunks fit more into limited working memory."],
      ["What is metacognition?", "Thinking about your own thinking and monitoring understanding", ["Memorising definitions", "Speed reading", "Studying without breaks"], "It helps you notice what you do not yet know."],
      ["What is deliberate practice?", "Focused practice on weaknesses with feedback", ["Repeating what you already know", "Practising without goals", "Practising only for time"], "Targeted feedback drives improvement."],
      ["What is the Pomodoro technique?", "Short focused work blocks with breaks", ["Long uninterrupted study marathons", "Studying only in the morning", "Group study only"], "Fixed intervals limit fatigue and distraction."],
      ["What is active recall?", "Retrieving answers without looking at the material", ["Rereading highlighted text", "Watching a video twice", "Copying notes"], "It exposes gaps immediately."],
      ["What is a growth mindset?", "Belief that ability improves with effort and strategy", ["Belief that intelligence is fixed", "Belief that talent alone matters", "Belief that grades do not matter"], "It encourages persistence after setbacks."],
      ["Why is sleep important for learning?", "Memory consolidation happens during sleep", ["Sleep only restores energy", "Sleep replaces the need to study", "Sleep has no effect on memory"], "Consolidation stabilises what you learned."],
      ["What is the best first step when planning revision?", "Diagnose weak topics with a practice test", ["Reread the easiest chapter", "Make a colour-coded timetable", "Copy the syllabus"], "Diagnosis tells you where the time should go."],
      ["What is a study schedule's most useful feature?", "Specific, timed tasks tied to topics", ["A long list of subjects", "Daily motivation quotes", "Colour coding only"], "Concrete tasks are easier to start and finish."],
      ["What is the forgetting curve?", "Memory decays quickly without review", ["Memory improves without review", "Memory is permanent after one reading", "Forgetting is unrelated to time"], "Ebbinghaus showed rapid early loss."],
      ["What is self-explanation?", "Explaining material to yourself as you study", ["Reading notes silently", "Highlighting key terms", "Listening to music"], "Explaining reveals gaps in understanding."],
      ["What is overlearning?", "Extra practice beyond initial mastery", ["Studying a topic once", "Skipping review after success", "Learning too many subjects"], "A little extra practice can aid retention."],
      ["Why does multitasking hurt study?", "Task switching costs attention and time", ["It allows two tasks at full speed", "It improves memory", "It reduces fatigue"], "Switching leaves less attention for each task."]
    ]
  });
})();
