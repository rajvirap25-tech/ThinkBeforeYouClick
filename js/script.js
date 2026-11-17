'use strict';

// Everything runs in the browser. No accounts or server are required.
const storagePrefix = 'think-before-you-click-';
let storageAvailable = true;
function readProgress(key, count) {
  try {
    const saved = JSON.parse(localStorage.getItem(storagePrefix + key));
    return Array.from({ length: count }, (_, index) => Array.isArray(saved) && saved[index] === true);
  } catch {
    return Array(count).fill(false);
  }
}
function saveProgress(key, progress) {
  try {
    localStorage.setItem(storagePrefix + key, JSON.stringify(progress));
  } catch {
    storageAvailable = false;
    document.querySelector('#save-status').textContent = 'Browser storage is unavailable. Progress will last for this visit.';
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuToggle.focus();
  }
});
const navLinks = [...navigation.querySelectorAll('a')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
function updateNavigation() {
  document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 15);
  document.querySelector('.back-top').classList.toggle('visible', window.scrollY > 500);
  let activeIndex = 0;
  navSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= 160) activeIndex = index;
  });
  navLinks.forEach((link, index) => {
    link.classList.toggle('active', index === activeIndex);
    if (index === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNavigation, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 800) closeMenu();
});
updateNavigation();
document.querySelector('#year').textContent = new Date().getFullYear();

// A weighted, illustrative recommendation system.
const feedTopics = [
  { name: 'Science', symbol: '✦', color: '#ece5fb', posts: ['The surprising science of everyday things', 'A closer look at the night sky', 'One experiment, a whole new perspective'] },
  { name: 'Creativity', symbol: '◈', color: '#f7e9de', posts: ['Turn a simple idea into a sketch', 'Find inspiration in everyday colours', 'Make something with what you have'] },
  { name: 'Outdoors', symbol: '☀', color: '#e6eddf', posts: ['A little fresh air, a new perspective', 'Discover a walking trail near you', 'Take your next break outside'] }
];
let feedWeights = [1, 1, 1];
let currentTopic = 0;
let feedTurn = 0;
function renderFeed() {
  const topic = feedTopics[currentTopic];
  document.querySelector('#post-topic').textContent = topic.name;
  document.querySelector('#post-title').textContent = topic.posts[feedTurn % topic.posts.length];
  const visual = document.querySelector('#post-visual');
  visual.textContent = topic.symbol;
  visual.style.background = topic.color;
  const total = feedWeights.reduce((sum, weight) => sum + weight, 0);
  document.querySelector('#feed-bars').innerHTML = feedTopics.map((item, index) => {
    const percentage = Math.round(feedWeights[index] / total * 100);
    return `<div class="mix-row"><div class="mix-label"><span>${item.name}</span><span>${percentage}%</span></div><div class="mix-track"><div class="mix-fill" style="width:${percentage}%"></div></div></div>`;
  }).join('');
}
document.querySelector('#like-post').addEventListener('click', () => {
  const likedTopic = feedTopics[currentTopic].name;
  feedWeights[currentTopic] += 2;
  feedTurn++;
  // Weighted selection makes engaged topics more likely while retaining variety.
  let draw = Math.random() * feedWeights.reduce((sum, weight) => sum + weight, 0);
  currentTopic = feedWeights.findIndex(weight => (draw -= weight) < 0);
  document.querySelector('#feed-feedback').textContent = `You liked ${likedTopic}. Its share increased. Repeated engagement can narrow what a feed shows you.`;
  renderFeed();
});
document.querySelector('#skip-post').addEventListener('click', () => {
  feedWeights[currentTopic] = Math.max(1, feedWeights[currentTopic] - 1);
  currentTopic = (currentTopic + 1) % feedTopics.length;
  feedTurn++;
  document.querySelector('#feed-feedback').textContent = 'You skipped a post. Here is another topic to explore. Skips can also signal your interests.';
  renderFeed();
});
document.querySelector('#reset-feed').addEventListener('click', () => {
  feedWeights = [1, 1, 1];
  currentTopic = 0;
  feedTurn = 0;
  document.querySelector('#feed-feedback').textContent = 'Feed reset. Try liking a post to change your mix.';
  renderFeed();
});
renderFeed();

const habits = ['Set a daily screen-time limit', 'Take regular screen breaks', 'Put your phone away before bed', 'Choose positive, educational content', 'Verify information before sharing', 'Make time for something offline'];
let habitProgress = readProgress('habits', habits.length);
document.querySelector('#habit-list').innerHTML = habits.map((habit, index) => `<label class="habit-item"><input type="checkbox" data-habit="${index}" ${habitProgress[index] ? 'checked' : ''}><span>${habit}</span></label>`).join('');
function updateHabits() {
  const completed = habitProgress.filter(Boolean).length;
  document.querySelector('#habit-count').textContent = `${completed} / ${habits.length}`;
  document.querySelector('#habit-progress').value = completed;
  document.querySelector('#habit-status').textContent = completed === 6 ? 'Six small wins. Take a moment to enjoy your progress.' : `${completed} of 6 complete. Every small choice counts.`;
}
document.querySelector('#habit-list').addEventListener('change', event => {
  habitProgress[Number(event.target.dataset.habit)] = event.target.checked;
  saveProgress('habits', habitProgress);
  updateHabits();
});
document.querySelector('#reset-habits').addEventListener('click', () => {
  habitProgress.fill(false);
  document.querySelectorAll('[data-habit]').forEach(input => { input.checked = false; });
  saveProgress('habits', habitProgress);
  updateHabits();
});
updateHabits();

const assessmentQuestions = [
  { text: 'Do you check your phone immediately after waking up?', positive: false, tip: 'Try starting your morning with a short phone-free routine.' },
  { text: 'Do you scroll for longer than you planned?', positive: false, tip: 'Set a reminder before opening your favourite feed.' },
  { text: 'Do you verify information before sharing?', positive: true, tip: 'Check the original source before sharing a claim.' },
  { text: 'Do you take regular breaks from screens?', positive: true, tip: 'Add a short offline break between study sessions.' },
  { text: 'Do you use your phone while studying?', positive: false, tip: 'Keep your phone out of reach during a focused study block.' }
];
document.querySelector('#assessment-questions').innerHTML = assessmentQuestions.map((question, index) => `<label class="assessment-question"><span>${question.text}</span><select name="answer-${index}" required><option value="">Choose an answer</option><option value="0">Rarely</option><option value="1">Sometimes</option><option value="2">Often</option></select></label>`).join('');
const assessmentForm = document.querySelector('#assessment-form');
assessmentForm.addEventListener('submit', event => {
  event.preventDefault();
  const answers = new FormData(assessmentForm);
  let score = 0;
  const suggestions = [];
  assessmentQuestions.forEach((question, index) => {
    const answer = Number(answers.get(`answer-${index}`));
    const points = question.positive ? answer : 2 - answer;
    score += points;
    if (points < 2) suggestions.push(question.tip);
  });
  const message = score >= 8 ? 'You are building thoughtful habits.' : score >= 5 ? 'You have a foundation to build on.' : 'A fresh start can begin with one small choice.';
  const result = document.querySelector('#assessment-result');
  result.innerHTML = `<h3>${score} / 10 · Your reflection score</h3><p>${message}</p><ul>${(suggestions.length ? suggestions : ['Keep checking in with yourself as your routine changes.']).map(tip => `<li>${tip}</li>`).join('')}</ul>`;
  result.hidden = false;
  document.querySelector('#retake-assessment').hidden = false;
  result.focus();
});
document.querySelector('#retake-assessment').addEventListener('click', () => {
  assessmentForm.reset();
  document.querySelector('#assessment-result').hidden = true;
  document.querySelector('#retake-assessment').hidden = true;
  assessmentForm.querySelector('select').focus();
});

const quizQuestions = [
  { question: 'What does artificial intelligence learn from?', answers: ['Patterns in data', 'Only human emotions', 'Every thought you have'], correct: 0, explanation: 'AI systems learn patterns from data. Those patterns can help them make predictions or generate content.' },
  { question: 'What can influence your social media recommendations?', answers: ['Your phone case colour', 'Watch time, likes, and searches', 'Only the time of day'], correct: 1, explanation: 'Engagement signals, including watch time, likes, and searches, can influence recommendations.' },
  { question: 'A surprising story goes viral. What should you do before sharing?', answers: ['Share because it has many likes', 'Check only the headline', 'Verify the original source and evidence'], correct: 2, explanation: 'Popularity does not establish accuracy. Check the source, date, evidence, and other trusted reporting.' },
  { question: 'Which choice helps protect your accounts?', answers: ['Use one password everywhere', 'Use unique passwords and two-step verification', 'Share your password with friends'], correct: 1, explanation: 'A long, unique password and two-step verification help protect each account.' },
  { question: 'What is a thoughtful habit during a study session?', answers: ['Keep checking every notification', 'Scroll whenever a task gets difficult', 'Take planned breaks and reduce distractions'], correct: 2, explanation: 'Planned breaks and fewer distractions help you use your attention intentionally.' },
  { question: 'An AI chatbot gives a confident answer. What should you remember?', answers: ['It can still be wrong', 'Confidence guarantees accuracy', 'You never need other sources'], correct: 0, explanation: 'AI can generate convincing mistakes. Verify important information with reliable sources.' }
];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
const quizNext = document.querySelector('#quiz-next');
function renderQuiz() {
  const question = quizQuestions[quizIndex];
  quizAnswered = false;
  document.querySelector('#quiz-counter').textContent = `${quizIndex + 1} / ${quizQuestions.length}`;
  document.querySelector('#quiz-progress').value = quizIndex;
  document.querySelector('#quiz-question').textContent = question.question;
  document.querySelector('#quiz-options').innerHTML = question.answers.map((answer, index) => `<button type="button" class="quiz-option" data-answer="${index}"><span aria-hidden="true">${String.fromCharCode(65 + index)}</span>${answer}</button>`).join('');
  document.querySelector('#quiz-feedback').textContent = '';
  quizNext.textContent = quizIndex === quizQuestions.length - 1 ? 'See my result →' : 'Next question →';
  quizNext.disabled = true;
}
document.querySelector('#quiz-options').addEventListener('click', event => {
  const answerButton = event.target.closest('[data-answer]');
  if (!answerButton || quizAnswered) return;
  quizAnswered = true;
  const answer = Number(answerButton.dataset.answer);
  const question = quizQuestions[quizIndex];
  const correct = answer === question.correct;
  if (correct) quizScore++;
  document.querySelectorAll('.quiz-option').forEach(button => {
    button.disabled = true;
    if (Number(button.dataset.answer) === question.correct) button.classList.add('correct');
  });
  if (!correct) answerButton.classList.add('incorrect');
  document.querySelector('#quiz-feedback').textContent = `${correct ? 'Correct!' : 'Keep learning.'} ${question.explanation}`;
  quizNext.disabled = false;
});
quizNext.addEventListener('click', () => {
  if (quizIndex === quizQuestions.length) {
    quizIndex = 0;
    quizScore = 0;
    renderQuiz();
  } else if (quizAnswered) {
    quizIndex++;
    if (quizIndex < quizQuestions.length) renderQuiz();
    else {
      document.querySelector('#quiz-counter').textContent = 'Complete';
      document.querySelector('#quiz-progress').value = quizQuestions.length;
      document.querySelector('#quiz-question').textContent = `You scored ${quizScore} out of ${quizQuestions.length}.`;
      document.querySelector('#quiz-options').innerHTML = '';
      document.querySelector('#quiz-feedback').textContent = quizScore >= 5 ? 'Thoughtful clicking starts with awareness. Keep putting what you know into practice.' : 'Every question is a chance to learn. Explore the guide and give it another try.';
      quizNext.textContent = 'Restart quiz ↺';
    }
  }
  document.querySelector('#quiz-question').focus();
});
renderQuiz();

const challengeTasks = ['Reduce unnecessary scrolling', 'Take regular screen breaks', 'Keep meals phone-free', 'Verify before you share', 'Follow positive, educational content', 'Make time for an offline activity', 'Reflect on your digital habits'];
let challengeProgress = readProgress('challenge', challengeTasks.length);
document.querySelector('#challenge-days').innerHTML = challengeTasks.map((task, index) => `<label class="challenge-day"><strong>DAY ${index + 1}</strong><span>${task}</span><input type="checkbox" data-day="${index}" aria-label="Complete day ${index + 1}, ${task.toLowerCase()}" ${challengeProgress[index] ? 'checked' : ''}></label>`).join('');
function updateChallenge() {
  const completed = challengeProgress.filter(Boolean).length;
  document.querySelector('#challenge-percent').textContent = `${Math.round(completed / 7 * 100)}%`;
  document.querySelector('#challenge-progress').value = completed;
  if (storageAvailable) document.querySelector('#save-status').textContent = completed === 7 ? 'All seven days complete. Keep the habits that worked for you. Your progress is saved.' : `${completed} of 7 days complete. Your progress is saved in this browser.`;
}
document.querySelector('#challenge-days').addEventListener('change', event => {
  challengeProgress[Number(event.target.dataset.day)] = event.target.checked;
  saveProgress('challenge', challengeProgress);
  updateChallenge();
});
document.querySelector('#reset-challenge').addEventListener('click', () => {
  challengeProgress.fill(false);
  document.querySelectorAll('[data-day]').forEach(input => { input.checked = false; });
  saveProgress('challenge', challengeProgress);
  updateChallenge();
});
updateChallenge();
